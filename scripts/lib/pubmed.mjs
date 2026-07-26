// PubMed E-utilities client (NCBI)
// Uses ESearch + ESummary to find and retrieve paper metadata.

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.NCBI_API_KEY || process.env.PUBMED_API_KEY || '';
const RATE_DELAY_MS = API_KEY ? 120 : 380; // 10 req/s with key, ~3 req/s without

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Search PubMed for PMIDs matching the query.
 * @param {string} query - PubMed search query
 * @param {object} opts - { retMax, mindate, maxdate, datetype }
 * @returns {Promise<string[]>} Array of PMID strings
 */
export async function esearch(query, opts = {}) {
  const {
    retMax = 50,
    mindate = null,
    maxdate = null,
    datetype = 'pdat',
  } = opts;

  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmax: String(retMax),
    retmode: 'json',
    sort: 'date',
  });

  if (mindate) params.set('mindate', mindate);
  if (maxdate) params.set('maxdate', maxdate);
  if (mindate || maxdate) params.set('datetype', datetype);
  if (API_KEY) params.set('api_key', API_KEY);

  const url = `${EUTILS_BASE}/esearch.fcgi?${params.toString()}`;
  const resp = await fetchWithRetry(url);
  const data = await resp.json();
  return data?.esearchresult?.idlist || [];
}

/**
 * Fetch summary data for a list of PMIDs.
 * @param {string[]} pmids
 * @returns {Promise<object[]>} Array of paper objects
 */
export async function esummary(pmids) {
  if (!pmids.length) return [];

  const results = [];
  // Process in batches of 200
  for (let i = 0; i < pmids.length; i += 200) {
    const batch = pmids.slice(i, i + 200);
    const params = new URLSearchParams({
      db: 'pubmed',
      id: batch.join(','),
      retmode: 'json',
    });
    if (API_KEY) params.set('api_key', API_KEY);

    const url = `${EUTILS_BASE}/esummary.fcgi?${params.toString()}`;
    const resp = await fetchWithRetry(url);
    const data = await resp.json();
    const result = data?.result || {};

    for (const pmid of batch) {
      const rec = result[pmid];
      if (!rec || rec.error) continue;
      results.push(parseSummaryRecord(pmid, rec));
    }

    if (i + 200 < pmids.length) await sleep(RATE_DELAY_MS);
  }

  return results;
}

/**
 * Parse an ESummary record into a clean paper object.
 */
function parseSummaryRecord(pmid, rec) {
  const authors = (rec.authors || []).map((a) => a.name).filter(Boolean);
  return {
    pmid,
    title: (rec.title || '').trim().replace(/\.$/, ''),
    journal: rec.fulljournalname || rec.source || '',
    pubDate: rec.pubdate || rec.sortpubdate || '',
    epubDate: rec.epubdate || '',
    authors: authors.slice(0, 10),
    doi: extractDoi(rec.articleids || []),
    abstract: '', // ESummary does not include abstract; left empty
    pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  };
}

function extractDoi(articleIds) {
  for (const id of articleIds) {
    if (id.idtype === 'doi' && id.value) return id.value;
  }
  return '';
}

async function fetchWithRetry(url, retries = 3) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Manifestation-Research/1.0 (GitHub Actions)' },
        signal: AbortSignal.timeout(30000),
      });
      if (resp.ok) return resp;
      if (resp.status === 429) {
        const wait = (attempt + 1) * 5000;
        console.error(`  Rate limited (429), waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      throw new Error(`HTTP ${resp.status} for ${url}`);
    } catch (err) {
      lastErr = err;
      const wait = (attempt + 1) * 2000;
      console.error(`  Attempt ${attempt + 1}/${retries} failed: ${err.message}`);
      if (attempt < retries - 1) await sleep(wait);
    }
  }
  throw lastErr;
}

/**
 * High-level: search multiple queries, combine, deduplicate, and fetch summaries.
 * @param {Array<{name:string, query:string}>} queries
 * @param {object} opts - { retMax, daysBack }
 * @returns {Promise<object[]>} Deduplicated paper objects
 */
export async function searchAndFetch(queries, opts = {}) {
  const { retMax = 30, daysBack = 21 } = opts;
  const mindate = getDateNDaysAgo(daysBack);

  const allPmids = new Set();
  const pmidToQueries = new Map();

  for (const { name, query } of queries) {
    try {
      console.error(`  Searching: ${name}...`);
      const pmids = await esearch(query, { retMax, mindate });
      console.error(`    Found ${pmids.length} PMIDs`);
      for (const pmid of pmids) {
        allPmids.add(pmid);
        if (!pmidToQueries.has(pmid)) pmidToQueries.set(pmid, []);
        pmidToQueries.get(pmid).push(name);
      }
      await sleep(RATE_DELAY_MS);
    } catch (err) {
      console.error(`  Error searching "${name}": ${err.message}`);
    }
  }

  console.error(`  Total unique PMIDs: ${allPmids.size}`);
  const pmids = [...allPmids];
  const papers = await esummary(pmids);

  // Attach which queries matched each paper
  for (const paper of papers) {
    paper.matchedQueries = pmidToQueries.get(paper.pmid) || [];
  }

  return papers;
}

function getDateNDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}
