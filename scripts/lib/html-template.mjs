// HTML template generators for Manifestation Research weekly reports.
// Matches the warm cream / copper color scheme of Psychiatry-brain.

const COMMON_CSS = `
  :root { --bg: #f6f1e8; --surface: #fffaf2; --line: #d8c5ab; --text: #2b2118; --muted: #766453; --accent: #8c4f2b; --accent-soft: #ead2bf; --card-bg: color-mix(in srgb, var(--surface) 92%, white); }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: radial-gradient(circle at top, #fff6ea 0, var(--bg) 55%, #ead8c6 100%); color: var(--text); font-family: "Noto Sans TC", "PingFang TC", "Helvetica Neue", Arial, sans-serif; min-height: 100vh; overflow-x: hidden; }
  .container { position: relative; z-index: 1; max-width: 880px; margin: 0 auto; padding: 60px 32px 80px; }
  header { display: flex; align-items: center; gap: 16px; margin-bottom: 52px; animation: fadeDown 0.6s ease both; }
  .logo { width: 48px; height: 48px; border-radius: 14px; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 4px 20px rgba(140,79,43,0.25); }
  .header-text h1 { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
  .header-meta { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; align-items: center; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; letter-spacing: 0.3px; }
  .badge-date { background: var(--accent-soft); border: 1px solid var(--line); color: var(--accent); }
  .badge-count { background: rgba(140,79,43,0.06); border: 1px solid var(--line); color: var(--muted); }
  .badge-source { background: transparent; color: var(--muted); font-size: 11px; padding: 0 4px; }
  .summary-card { background: var(--card-bg); border: 1px solid var(--line); border-radius: 24px; padding: 28px 32px; margin-bottom: 32px; box-shadow: 0 20px 60px rgba(61,36,15,0.06); animation: fadeUp 0.5s ease 0.1s both; }
  .summary-card h2 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.6px; color: var(--accent); margin-bottom: 16px; }
  .summary-text { font-size: 15px; line-height: 1.8; color: var(--text); }
  .section { margin-bottom: 36px; animation: fadeUp 0.5s ease both; }
  .section-title { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
  .section-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; background: var(--accent-soft); }
  .news-card { background: var(--card-bg); border: 1px solid var(--line); border-radius: 24px; padding: 22px 26px; margin-bottom: 12px; box-shadow: 0 8px 30px rgba(61,36,15,0.04); transition: background 0.2s, border-color 0.2s, transform 0.2s; }
  .news-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(61,36,15,0.08); }
  .news-card.featured { border-left: 3px solid var(--accent); }
  .news-card.featured:hover { border-color: var(--accent); }
  .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .rank-badge { background: var(--accent); color: #fff7f0; font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 6px; }
  .emoji-icon { font-size: 18px; }
  .card-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .emoji-sm { font-size: 14px; }
  .news-card h3 { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 8px; line-height: 1.5; }
  .journal-source { font-size: 12px; color: var(--accent); margin-bottom: 8px; opacity: 0.8; }
  .news-card p { font-size: 13.5px; line-height: 1.75; color: var(--muted); }
  .card-footer { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .tag { padding: 2px 9px; background: var(--accent-soft); border-radius: 999px; font-size: 11px; color: var(--accent); }
  .news-card a { font-size: 12px; color: var(--accent); text-decoration: none; opacity: 0.7; margin-left: auto; }
  .news-card a:hover { opacity: 1; }
  .utility-high { color: #5a7a3a; font-size: 11px; font-weight: 600; padding: 2px 8px; background: rgba(90,122,58,0.1); border-radius: 4px; }
  .utility-mid { color: #9f7a2e; font-size: 11px; font-weight: 600; padding: 2px 8px; background: rgba(159,122,46,0.1); border-radius: 4px; }
  .utility-low { color: var(--muted); font-size: 11px; font-weight: 600; padding: 2px 8px; background: rgba(118,100,83,0.08); border-radius: 4px; }
  .utility-sm { font-size: 10px; }
  .pico-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; padding: 12px; background: rgba(255,253,249,0.8); border-radius: 14px; border: 1px solid var(--line); }
  .pico-item { display: flex; gap: 8px; align-items: baseline; }
  .pico-label { font-size: 10px; font-weight: 700; color: #fff7f0; background: var(--accent); padding: 2px 6px; border-radius: 4px; flex-shrink: 0; }
  .pico-text { font-size: 12px; color: var(--muted); line-height: 1.4; }
  .keywords-section { margin-bottom: 36px; }
  .keywords { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .keyword { padding: 5px 14px; background: var(--accent-soft); border: 1px solid var(--line); border-radius: 20px; font-size: 12px; color: var(--accent); cursor: default; transition: background 0.2s; }
  .keyword:hover { background: rgba(140,79,43,0.18); }
  .topic-section { margin-bottom: 36px; }
  .topic-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .topic-name { font-size: 13px; color: var(--muted); width: 120px; flex-shrink: 0; text-align: right; }
  .topic-bar-bg { flex: 1; height: 8px; background: var(--line); border-radius: 4px; overflow: hidden; }
  .topic-bar { height: 100%; background: linear-gradient(90deg, var(--accent), #c47a4a); border-radius: 4px; transition: width 0.6s ease; }
  .topic-count { font-size: 12px; color: var(--accent); width: 24px; }
  .links-grid { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; animation: fadeUp 0.5s ease 0.4s both; }
  .ext-link { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 16px; background: var(--card-bg); border: 1px solid var(--line); border-radius: 20px; text-decoration: none; color: var(--text); transition: all 0.2s; box-shadow: 0 8px 30px rgba(61,36,15,0.04); }
  .ext-link:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(61,36,15,0.08); }
  .ext-link .ext-icon { font-size: 28px; }
  .ext-link .ext-label { font-size: 13px; font-weight: 600; color: var(--text); text-align: center; line-height: 1.4; }
  .ext-link .ext-sub { font-size: 11px; color: var(--muted); }
  footer { margin-top: 32px; padding-top: 22px; border-top: 1px solid var(--line); font-size: 11.5px; color: var(--muted); display: flex; justify-content: space-between; animation: fadeUp 0.5s ease 0.5s both; }
  footer a { color: var(--muted); text-decoration: none; }
  footer a:hover { color: var(--accent); }
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 600px) { .container { padding: 36px 18px 60px; } .summary-card, .news-card { padding: 20px 18px; } .pico-grid { grid-template-columns: 1fr; } footer { flex-direction: column; gap: 6px; text-align: center; } .topic-name { width: 80px; font-size: 11px; } .links-grid { grid-template-columns: 1fr; } }
`;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function utilityBadge(utility) {
  const map = {
    high: { cls: 'utility-high', label: '高實用性' },
    mid: { cls: 'utility-mid', label: '中實用性' },
    low: { cls: 'utility-low', label: '低實用性' },
  };
  const u = map[utility] || map.mid;
  return `<span class="${u.cls}">${escapeHtml(u.label)}</span>`;
}

function utilityBadgeSm(utility) {
  const map = { high: { cls: 'utility-high utility-sm', label: '高' }, mid: { cls: 'utility-mid utility-sm', label: '中' }, low: { cls: 'utility-low utility-sm', label: '低' } };
  const u = map[utility] || map.mid;
  return `<span class="${u.cls}">${escapeHtml(u.label)}</span>`;
}

function picoGrid(pico) {
  if (!pico || (!pico.P && !pico.I && !pico.C && !pico.O)) return '';
  const rows = [
    pico.P ? `<div class="pico-item"><span class="pico-label">P</span><span class="pico-text">${escapeHtml(pico.P)}</span></div>` : '',
    pico.I ? `<div class="pico-item"><span class="pico-label">I</span><span class="pico-text">${escapeHtml(pico.I)}</span></div>` : '',
    pico.C ? `<div class="pico-item"><span class="pico-label">C</span><span class="pico-text">${escapeHtml(pico.C)}</span></div>` : '',
    pico.O ? `<div class="pico-item"><span class="pico-label">O</span><span class="pico-text">${escapeHtml(pico.O)}</span></div>` : '',
  ].filter(Boolean);
  return rows.length ? `<div class="pico-grid">${rows.join('\n')}</div>` : '';
}

function tagsHtml(tags) {
  if (!tags || !tags.length) return '';
  return tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('');
}

function pubmedLink(pmid) {
  return pmid ? `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(pmid)}/` : '#';
}

/**
 * Generate the full weekly report HTML.
 * @param {object} params - { date, dateZh, weekdayZh, paperCount, analysis }
 *   analysis = { summary, topPicks, otherPapers, topics, keywords }
 */
export function generateReportHTML({ date, dateZh, weekdayZh, paperCount, analysis }) {
  const a = analysis || {};
  const topPicks = a.topPicks || [];
  const otherPapers = a.otherPapers || [];
  const topics = a.topics || [];
  const keywords = a.keywords || [];

  const topPicksHtml = topPicks.length
    ? `<div class='section'><div class='section-title'><span class='section-icon'>⭐</span>本週精選 TOP Picks</div>
${topPicks
  .map(
    (p) => `        <div class="news-card featured">
          <div class="card-header">
            <span class="rank-badge">#${escapeHtml(String(p.rank || ''))}</span>
            <span class="emoji-icon">${escapeHtml(p.emoji || '📄')}</span>
            ${utilityBadge(p.utility)}
          </div>
          <h3>${escapeHtml(p.titleZh || '')}</h3>
          <p class="journal-source">${escapeHtml(p.journal || '')}${p.titleOriginal ? ' &middot; ' + escapeHtml(p.titleOriginal) : ''}</p>
          <p>${escapeHtml(p.summary || '')}</p>
          ${picoGrid(p.pico)}
          <div class="card-footer">
            ${tagsHtml(p.tags)}
            <a href="${pubmedLink(p.pmid)}" target="_blank">閱讀原文 &rarr;</a>
          </div>
        </div>`
  )
  .join('\n')}
      </div>`
    : '';

  const otherPapersHtml = otherPapers.length
    ? `<div class='section'><div class='section-title'><span class='section-icon'>📚</span>其他值得關注的文獻</div>
${otherPapers
  .map(
    (p) => `        <div class="news-card">
          <div class="card-header-row">
            <span class="emoji-sm">${escapeHtml(p.emoji || '📄')}</span>
            ${utilityBadgeSm(p.utility)}
          </div>
          <h3>${escapeHtml(p.titleZh || '')}</h3>
          <p class="journal-source">${escapeHtml(p.journal || '')}</p>
          <p>${escapeHtml(p.summary || '')}</p>
          <div class="card-footer">
            ${tagsHtml(p.tags)}
            <a href="${pubmedLink(p.pmid)}" target="_blank">PubMed &rarr;</a>
          </div>
        </div>`
  )
  .join('\n')}
      </div>`
    : '';

  const maxCount = Math.max(...topics.map((t) => t.count || 0), 1);
  const topicsHtml = topics.length
    ? `<div class='topic-section section'><div class='section-title'><span class='section-icon'>📊</span>主題分佈</div>
${topics
  .map(
    (t) => `        <div class="topic-row">
          <span class="topic-name">${escapeHtml(t.name || '')}</span>
          <div class="topic-bar-bg"><div class="topic-bar" style="width:${Math.round(((t.count || 0) / maxCount) * 100)}%"></div></div>
          <span class="topic-count">${escapeHtml(String(t.count || 0))}</span>
        </div>`
  )
  .join('\n')}
      </div>`
    : '';

  const keywordsHtml = keywords.length
    ? `<div class='keywords-section section'><div class='section-title'><span class='section-icon'>🏷️</span>關鍵字</div><div class='keywords'>${keywords.map((k) => `<span class="keyword">${escapeHtml(k)}</span>`).join('')}</div></div>`
    : '';

  const linksHtml = `
  <div class="links-grid">
    <a href="https://www.leepsyclinic.com/" class="ext-link" target="_blank" rel="noopener">
      <span class="ext-icon">🏥</span>
      <span class="ext-label">李政洋身心診所</span>
      <span class="ext-sub">官網首頁</span>
    </a>
    <a href="https://blog.leepsyclinic.com/" class="ext-link" target="_blank" rel="noopener">
      <span class="ext-icon">📩</span>
      <span class="ext-label">訂閱電子報</span>
      <span class="ext-sub">最新衛教文章</span>
    </a>
    <a href="https://buymeacoffee.com/CYlee" class="ext-link" target="_blank" rel="noopener">
      <span class="ext-icon">☕</span>
      <span class="ext-label">Buy Me a Coffee</span>
      <span class="ext-sub">支持本計畫</span>
    </a>
  </div>`;

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Manifestation Research &middot; 顯化研究文獻周報 &middot; ${dateZh}</title>
<meta name="description" content="${escapeHtml(dateZh)} 顯化研究文獻周報，由 AI 自動彙整 PubMed 最新論文"/>
<style>${COMMON_CSS}</style>
</head>
<body>
<div class="container">
  <header>
    <div class="logo">✨</div>
    <div class="header-text">
      <h1>Manifestation Research &middot; 顯化研究文獻周報</h1>
      <div class="header-meta">
        <span class="badge badge-date">📅 ${escapeHtml(dateZh)}（${escapeHtml(weekdayZh)}）</span>
        <span class="badge badge-count">📊 ${paperCount} 篇文獻</span>
        <span class="badge badge-source">Powered by PubMed + NVIDIA Nemotron 3 Super</span>
      </div>
    </div>
  </header>

  <div class="summary-card">
    <h2>📋 本週文獻趨勢</h2>
    <p class="summary-text">${escapeHtml(a.summary || '本週無新增文獻。')}</p>
  </div>

  ${topPicksHtml}
  ${otherPapersHtml}
  ${topicsHtml}
  ${keywordsHtml}

  ${linksHtml}

  <footer>
    <span>資料來源：PubMed &middot; 分析模型：NVIDIA Nemotron 3 Super</span>
    <span><a href="../index.html">返回總覽</a> &middot; <a href="https://github.com/u8901006/Manifestation-Research">GitHub</a></span>
  </footer>
</div>
</body>
</html>`;
}

/**
 * Generate the index page listing all weekly reports.
 * @param {Array<{date:string, dateZh:string, weekdayZh:string, filename:string, paperCount:number}>} reports
 */
export function generateIndexHTML(reports) {
  const count = reports.length;
  const listHtml = reports
    .map(
      (r) =>
        `  <li><a href="${r.filename}">📅 ${escapeHtml(r.dateZh)}（${escapeHtml(r.weekdayZh)}） · 📊 ${r.paperCount || 0} 篇</a></li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Manifestation Research · 顯化研究文獻周報</title>
<meta name="description" content="顯化研究文獻周報 · 每週自動更新，由 AI 自動彙整 PubMed 最新論文"/>
<style>
  :root { --bg: #f6f1e8; --surface: #fffaf2; --line: #d8c5ab; --text: #2b2118; --muted: #766453; --accent: #8c4f2b; --accent-soft: #ead2bf; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: radial-gradient(circle at top, #fff6ea 0, var(--bg) 55%, #ead8c6 100%); color: var(--text); font-family: "Noto Sans TC", "PingFang TC", "Helvetica Neue", Arial, sans-serif; min-height: 100vh; }
  .container { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; padding: 80px 24px; }
  .logo { font-size: 48px; text-align: center; margin-bottom: 16px; }
  h1 { text-align: center; font-size: 24px; color: var(--text); margin-bottom: 8px; }
  .subtitle { text-align: center; color: var(--accent); font-size: 14px; margin-bottom: 48px; }
  .count { text-align: center; color: var(--muted); font-size: 13px; margin-bottom: 32px; }
  ul { list-style: none; }
  li { margin-bottom: 8px; }
  a { color: var(--text); text-decoration: none; display: block; padding: 14px 20px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; transition: all 0.2s; font-size: 15px; }
  a:hover { background: var(--accent-soft); border-color: var(--accent); transform: translateX(4px); }
  .links-grid { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .ext-link { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; text-decoration: none; color: var(--text); transition: all 0.2s; }
  .ext-link:hover { border-color: var(--accent); transform: translateY(-2px); }
  .ext-link .ext-icon { font-size: 24px; }
  .ext-link .ext-label { font-size: 12px; font-weight: 600; text-align: center; }
  footer { margin-top: 56px; text-align: center; font-size: 12px; color: var(--muted); }
  footer a { display: inline; padding: 0; background: none; border: none; color: var(--muted); }
  footer a:hover { color: var(--accent); }
  @media (max-width: 600px) { .links-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="container">
  <div class="logo">✨</div>
  <h1>Manifestation Research</h1>
  <p class="subtitle">顯化研究文獻周報 · 每週自動更新</p>
  <p class="count">共 ${count} 期周報</p>
  <ul>
${listHtml}
  </ul>
  <div class="links-grid">
    <a href="https://www.leepsyclinic.com/" class="ext-link" target="_blank" rel="noopener">
      <span class="ext-icon">🏥</span>
      <span class="ext-label">李政洋身心診所</span>
    </a>
    <a href="https://blog.leepsyclinic.com/" class="ext-link" target="_blank" rel="noopener">
      <span class="ext-icon">📩</span>
      <span class="ext-label">訂閱電子報</span>
    </a>
    <a href="https://buymeacoffee.com/CYlee" class="ext-link" target="_blank" rel="noopener">
      <span class="ext-icon">☕</span>
      <span class="ext-label">Buy Me a Coffee</span>
    </a>
  </div>
  <footer>
    <p>Powered by PubMed + NVIDIA Nemotron 3 Super · <a href="https://github.com/u8901006/Manifestation-Research">GitHub</a></p>
  </footer>
</div>
</body>
</html>`;
}

// Helper: format date as "YYYY年M月D日"
export function formatDateZh(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
}

// Helper: get Chinese weekday name
export function getWeekdayZh(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const names = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return names[d.getUTCDay()];
}
