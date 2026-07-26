#!/usr/bin/env node
// generate-index.mjs — Scan docs/ for weekly report files and generate index.html.

import { writeFileSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateIndexHTML, formatDateZh, getWeekdayZh } from './lib/html-template.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS_DIR = resolve(ROOT, 'docs');

function extractPaperCount(html) {
  // Try to find "📊 N 篇文獻" in the header badge
  const match = html.match(/📊\s*(\d+)\s*篇文獻/);
  return match ? parseInt(match[1], 10) : 0;
}

function extractDateFromFilename(filename) {
  // manifestation-YYYY-MM-DD.html
  const match = filename.match(/manifestation-(\d{4}-\d{2}-\d{2})\.html/);
  return match ? match[1] : null;
}

function main() {
  console.error('=== Generating index page ===');

  const files = readdirSync(DOCS_DIR)
    .filter((f) => /^manifestation-\d{4}-\d{2}-\d{2}\.html$/.test(f))
    .sort()
    .reverse(); // Newest first

  console.error(`  Found ${files.length} report(s)`);

  const reports = files.map((filename) => {
    const date = extractDateFromFilename(filename);
    let paperCount = 0;
    try {
      const html = readFileSync(resolve(DOCS_DIR, filename), 'utf-8');
      paperCount = extractPaperCount(html);
    } catch {
      // Ignore read errors
    }
    return {
      date,
      dateZh: date ? formatDateZh(date) : filename,
      weekdayZh: date ? getWeekdayZh(date) : '',
      filename,
      paperCount,
    };
  });

  const html = generateIndexHTML(reports);
  const indexPath = resolve(DOCS_DIR, 'index.html');
  writeFileSync(indexPath, html, 'utf-8');
  console.error(`  Index saved: ${indexPath}`);
  console.log(`reports=${reports.length}`);
}

try {
  main();
} catch (err) {
  console.error('FATAL:', err);
  process.exit(1);
}
