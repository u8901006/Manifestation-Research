#!/usr/bin/env node
// generate-report.mjs — Read papers.json, call GLM for analysis,
// generate a styled HTML weekly report, and update seen-papers.json.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chatCompletion, parseJsonLenient } from './lib/glm-client.mjs';
import { generateReportHTML, formatDateZh, getWeekdayZh } from './lib/html-template.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SEEN_FILE = resolve(ROOT, 'data', 'seen-papers.json');
const DOCS_DIR = resolve(ROOT, 'docs');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { input: resolve(ROOT, 'papers.json'), output: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) opts.input = resolve(args[i + 1]);
    if (args[i] === '--output' && args[i + 1]) opts.output = resolve(args[i + 1]);
  }
  return opts;
}

function buildPapersContext(papers) {
  return papers
    .map((p, i) => {
      return [
        `--- Paper ${i + 1} ---`,
        `PMID: ${p.pmid}`,
        `Title: ${p.title}`,
        `Journal: ${p.journal}`,
        `Date: ${p.pubDate}`,
        `Authors: ${(p.authors || []).slice(0, 5).join(', ')}`,
        `DOI: ${p.doi || 'N/A'}`,
        `Matched categories: ${(p.matchedQueries || []).join(', ')}`,
      ].join('\n');
    })
    .join('\n\n');
}

function buildSystemPrompt(paperCount) {
  return `你是顯化研究（Manifestation Research）的學術分析助手。你的任務是分析來自 PubMed 的心理學、神經科學、精神醫學等領域的研究文獻，將它們整理成一份中文的週報。

研究主題涵蓋：顯化（manifestation）、吸引力法則、心智意象、視覺化、安慰劑/期望效應、目標設定、正向幻想、樂觀、自我效能、信念形成、預測處理、靈性與心理健康等。

請嚴格以 JSON 格式回應（不要加 markdown 程式碼區塊標記），結構如下：

{
  "summary": "200-400 字的整體摘要，描述本週文獻的主要趨勢和發現",
  "topPicks": [
    {
      "rank": 1,
      "emoji": "🧠",
      "titleZh": "中文翻譯標題",
      "titleOriginal": "原文英文標題",
      "journal": "期刊名稱",
      "summary": "100-200 字中文研究摘要，說明研究方法、主要發現和意義",
      "utility": "high | mid | low",
      "pico": { "P": "研究對象", "I": "介入/研究方法", "C": "對照組", "O": "研究結果" },
      "tags": ["標籤1", "標籤2", "標籤3"],
      "pmid": "PMID編號"
    }
  ],
  "otherPapers": [
    {
      "emoji": "📄",
      "titleZh": "中文翻譯標題",
      "journal": "期刊名稱",
      "summary": "50-100 字簡要摘要",
      "utility": "high | mid | low",
      "tags": ["標籤1", "標籤2"],
      "pmid": "PMID編號"
    }
  ],
  "topics": [
    { "name": "主題名稱", "count": 3 }
  ],
  "keywords": ["關鍵字1", "關鍵字2", ...]
}

規則：
1. topPicks 放最值得關注的 3-5 篇（有 PICO 分析），otherPicks 放其餘文獻
2. utility 評分標準：high = 臨床或實務高度相關，mid = 有參考價值，low = 理論性強但離應用較遠
3. 所有中文翻譯請使用台灣繁體中文，術語保留英文原文（如 fMRI、CBT）
4. topics 是將文獻按主題分類的統計，每個主題標出篇數
5. keywords 列出 10-20 個本週出現的重要關鍵字
6. 請務必輸出有效的 JSON，不要在 JSON 前後加入任何說明文字

本週共有 ${paperCount} 篇文獻需要分析。`;
}

function buildUserPrompt(papers) {
  const context = buildPapersContext(papers);
  return `以下是本週從 PubMed 搜尋到的 ${papers.length} 篇顯化研究相關文獻。請分析並整理成週報 JSON。

${context}

請以上述 JSON 格式回應。確保所有 paper 的 pmid 欄位填入正確的 PMID 編號。`;
}

function loadSeenPmids() {
  if (!existsSync(SEEN_FILE)) return { pmids: {}, lastUpdated: null };
  try {
    return JSON.parse(readFileSync(SEEN_FILE, 'utf-8'));
  } catch {
    return { pmids: {}, lastUpdated: null };
  }
}

function saveSeenPmids(seen, newPmids) {
  const today = new Date().toISOString().slice(0, 10);
  for (const pmid of newPmids) {
    seen.pmids[pmid] = today;
  }
  seen.lastUpdated = today;
  writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
}

function buildEmptyAnalysis(dateZh) {
  return {
    summary: `本週 PubMed 沒有新增符合顯化研究條件的文獻。系統將於下週繼續搜尋最新研究。`,
    topPicks: [],
    otherPapers: [],
    topics: [],
    keywords: [],
  };
}

async function main() {
  const opts = parseArgs();
  console.error('=== Generating weekly report ===');

  // Load papers
  const papersData = JSON.parse(readFileSync(opts.input, 'utf-8'));
  const papers = papersData.papers || [];
  const date = papersData.date;
  const dateZh = formatDateZh(date);
  const weekdayZh = getWeekdayZh(date);

  console.error(`  Date: ${date} (${dateZh} ${weekdayZh})`);
  console.error(`  Papers: ${papers.length}`);

  let analysis;

  if (papers.length === 0) {
    console.error('  No new papers this week. Generating empty report.');
    analysis = buildEmptyAnalysis(dateZh);
  } else {
    // Call GLM for analysis
    console.error('  Calling GLM API for analysis...');
    const systemPrompt = buildSystemPrompt(papers.length);
    const userPrompt = buildUserPrompt(papers);

    const raw = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.6, jsonMode: true }
    );

    analysis = parseJsonLenient(raw);
    if (!analysis) {
      console.error('  WARNING: JSON parsing failed, attempting raw content fallback...');
      // Last resort: use the raw text as summary if JSON parsing fails completely
      analysis = {
        summary: raw.slice(0, 500) || 'AI 分析結果解析失敗，請查看原始資料。',
        topPicks: [],
        otherPapers: papers.slice(0, 10).map((p, i) => ({
          emoji: '📄',
          titleZh: p.title,
          journal: p.journal,
          summary: '（原始摘要不可用）',
          utility: 'mid',
          tags: p.matchedQueries || [],
          pmid: p.pmid,
        })),
        topics: [],
        keywords: [],
      };
    }

    // Ensure required fields exist
    analysis.summary = analysis.summary || '本週文獻已分析。';
    analysis.topPicks = Array.isArray(analysis.topPicks) ? analysis.topPicks : [];
    analysis.otherPapers = Array.isArray(analysis.otherPapers) ? analysis.otherPapers : [];
    analysis.topics = Array.isArray(analysis.topics) ? analysis.topics : [];
    analysis.keywords = Array.isArray(analysis.keywords) ? analysis.keywords : [];

    console.error(`  Analysis complete: ${analysis.topPicks.length} top picks, ${analysis.otherPapers.length} other papers`);
  }

  // Generate HTML
  const html = generateReportHTML({
    date,
    dateZh,
    weekdayZh,
    paperCount: papers.length,
    analysis,
  });

  // Write report
  const filename = `manifestation-${date}.html`;
  const outputPath = opts.output || resolve(DOCS_DIR, filename);
  writeFileSync(outputPath, html, 'utf-8');
  console.error(`  Report saved: ${outputPath}`);

  // Update seen PMIDs
  if (papers.length > 0) {
    const seen = loadSeenPmids();
    saveSeenPmids(seen, papers.map((p) => p.pmid));
    console.error(`  Updated seen-papers.json with ${papers.length} new PMIDs`);
  }

  console.log(`filename=${filename}`);
  console.log(`paperCount=${papers.length}`);
  console.log(`date=${date}`);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
