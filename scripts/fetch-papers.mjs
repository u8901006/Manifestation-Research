#!/usr/bin/env node
// fetch-papers.mjs — Query PubMed for manifestation-related papers,
// deduplicate against previously seen PMIDs, and output papers.json.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEARCH_QUERIES } from './search-queries.mjs';
import { searchAndFetch } from './lib/pubmed.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SEEN_FILE = resolve(ROOT, 'data', 'seen-papers.json');
const OUTPUT_FILE = resolve(ROOT, 'papers.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { daysBack: 21, retMax: 30, maxPapers: 60, date: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) opts.daysBack = parseInt(args[i + 1], 10);
    if (args[i] === '--ret-max' && args[i + 1]) opts.retMax = parseInt(args[i + 1], 10);
    if (args[i] === '--max-papers' && args[i + 1]) opts.maxPapers = parseInt(args[i + 1], 10);
    if (args[i] === '--output' && args[i + 1]) opts.output = args[i + 1];
    if (args[i] === '--date' && args[i + 1]) opts.date = args[i + 1];
  }
  return opts;
}

function loadSeenPmids() {
  if (!existsSync(SEEN_FILE)) {
    return { pmids: {}, lastUpdated: null };
  }
  try {
    const raw = readFileSync(SEEN_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return { pmids: data.pmids || {}, lastUpdated: data.lastUpdated || null };
  } catch {
    console.error('Warning: seen-papers.json corrupted, starting fresh.');
    return { pmids: {}, lastUpdated: null };
  }
}

async function main() {
  const opts = parseArgs();
  console.error('=== Fetching manifestation research papers from PubMed ===');
  console.error(`  Queries: ${SEARCH_QUERIES.length}`);
  console.error(`  Days back: ${opts.daysBack}`);
  console.error(`  Max per query: ${opts.retMax}`);

  // Search all queries
  const allPapers = await searchAndFetch(SEARCH_QUERIES, {
    retMax: opts.retMax,
    daysBack: opts.daysBack,
  });

  console.error(`  Papers retrieved from PubMed: ${allPapers.length}`);

  // Deduplicate against seen PMIDs
  const seen = loadSeenPmids();
  const seenCount = Object.keys(seen.pmids).length;
  console.error(`  Previously seen PMIDs: ${seenCount}`);

  const newPapers = allPapers.filter((p) => !seen.pmids[p.pmid]);
  console.error(`  New papers (not yet seen): ${newPapers.length}`);

  // Limit to maxPapers
  const finalPapers = newPapers.slice(0, opts.maxPapers);
  if (newPapers.length > opts.maxPapers) {
    console.error(`  Capped to ${opts.maxPapers} papers`);
  }

  // Determine the report date: use --date override or today in Asia/Taipei
  let dateStr;
  if (opts.date && /^\d{4}-\d{2}-\d{2}$/.test(opts.date)) {
    dateStr = opts.date;
  } else {
    const now = new Date();
    const taipei = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    dateStr = `${taipei.getFullYear()}-${String(taipei.getMonth() + 1).padStart(2, '0')}-${String(taipei.getDate()).padStart(2, '0')}`;
  }

  const output = {
    date: dateStr,
    count: finalPapers.length,
    totalFound: allPapers.length,
    dedupRemoved: allPapers.length - newPapers.length,
    papers: finalPapers,
  };

  const outputPath = opts.output || OUTPUT_FILE;
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.error(`\n=== Done: ${finalPapers.length} new papers written to ${outputPath} ===`);

  // Print summary for GitHub Actions
  console.log(`date=${dateStr}`);
  console.log(`count=${finalPapers.length}`);
  console.log(`totalFound=${allPapers.length}`);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
