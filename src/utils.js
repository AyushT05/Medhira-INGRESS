import { INDIA_UUID, API_URL, SUMMARY_KEY_TO_LOCTYPE } from './constants';

// ── API helpers ──────────────────────────────────────────────────────────────

export async function fetchNode(uuid, name, loctype, parentUuid, parentName, year) {
  const payload = {
    approvalLevel: 1, category: null, component: 'recharge',
    computationType: 'normal', locname: name, loctype,
    locuuid: uuid, mapOnClickParams: 'false',
    parentLocName: parentName || 'INDIA',
    parentuuid: parentUuid || INDIA_UUID,
    period: 'annual', stateuuid: null, verificationStatus: 1,
    view: 'admin', year,
  };
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  return Array.isArray(json) ? json : [json];
}

export async function fetchForYear(uuid, name, loctype, parentUuid, parentName, year) {
  const cacheKey = `${uuid}_${year}`;
  const sessionData = sessionStorage.getItem(cacheKey);
  if (sessionData) {
    try { return JSON.parse(sessionData); } catch (e) { /* ignore */ }
  }
  const payload = {
    approvalLevel: 1, category: null, component: 'recharge',
    computationType: 'normal', locname: name, loctype,
    locuuid: uuid, mapOnClickParams: 'false',
    parentLocName: parentName || 'INDIA',
    parentuuid: parentUuid || INDIA_UUID,
    period: 'annual', stateuuid: null, verificationStatus: 1,
    view: 'admin', year,
  };
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  const arr = Array.isArray(json) ? json : [json];
  const matchedRecord = arr.find(d => d.locationUUID === uuid);
  const summary = arr.find(d => d.locationName === 'total') || arr[arr.length - 1] || null;
  const data = matchedRecord || summary || arr[0];
  try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) { /* ignore */ }
  return data;
}

// ── Data parsing helpers ─────────────────────────────────────────────────────

export function getSummaryRecord(arr) {
  return arr.find(d => d.locationName === 'total') || arr[arr.length - 1] || null;
}

export function getChildRecords(arr) {
  return arr.filter(d => d.locationName !== 'total' && d.locationUUID);
}

export function extractChildUuids(data) {
  if (!data?.reportSummary) return [];
  return Object.keys(data.reportSummary).filter(k => k !== 'total' && k.includes('-'));
}

export function inferChildLoctype(data) {
  if (!data?.reportSummary) return 'BLOCK';
  const rs = data.reportSummary;
  const sample = Object.values(rs).find(v => v && typeof v === 'object');
  if (!sample) return 'BLOCK';
  const key = Object.keys(sample)[0];
  return SUMMARY_KEY_TO_LOCTYPE[key] || 'BLOCK';
}

export function getChildBadge(reportEntry) {
  if (!reportEntry) return null;
  const counts = Object.values(reportEntry)[0] || {};
  if (counts.over_exploited) return 'over';
  if (counts.critical) return 'crit';
  if (counts.semi_critical) return 'semi';
  if (counts['Hilly Area'] && !counts.safe) return 'hilly';
  if (counts.salinity) return 'semi';
  if (counts.safe) return 'safe';
  return null;
}

export function fmtHam(v) {
  if (!v && v !== 0) return '—';
  if (v >= 1e5) return (v / 1e5).toFixed(3) + ' BCM';
  return v.toFixed(1) + ' ham';
}

// ── Text helpers ─────────────────────────────────────────────────────────────

export function mdToHtml(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^### (.*?)$/gm, '<p class="md-h3">$1</p>')
    .replace(/^## (.*?)$/gm, '<p class="md-h2">$1</p>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

export function parseReply(text) {
  const charts = [];
  let clean = text;
  const re = /CHART_JSON:\s*(\{[\s\S]*?\})\s*(?=CHART_JSON:|$)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    try { charts.push(JSON.parse(m[1])); } catch (e) { /* ignore */ }
    clean = clean.replace(m[0], '');
  }
  const trailing = /CHART_JSON:\s*(\{[\s\S]*\})$/;
  const tm = trailing.exec(clean);
  if (tm) {
    try { charts.push(JSON.parse(tm[1])); } catch (e) { /* ignore */ }
    clean = clean.replace(tm[0], '');
  }
  return { text: clean.trim(), charts: charts.length ? charts : null };
}

export function buildDataContext(d, nodeCache) {
  if (!d) return 'No data.';
  const f = v => (v != null && !isNaN(v)) ? Number(v).toFixed(2) : 'N/A';
  const rs = d.reportSummary?.total || {};
  let rsSummary = '';
  ['BLOCK', 'TALUK', 'FIRKA', 'VILLAGE', 'WATERSHED', 'TEHSIL', 'DISTRICT'].forEach(level => {
    if (rs[level]) {
      const cats = ['over_exploited', 'critical', 'semi_critical', 'safe', 'salinity', 'Hilly Area'];
      const parts = cats.filter(c => rs[level][c]).map(c => `${c}:${rs[level][c]}`);
      if (parts.length) rsSummary += `  ${level} → ${parts.join(', ')}\n`;
    }
  });
  const subIssues = [];
  if (d.reportSummary) {
    Object.entries(d.reportSummary).forEach(([uuid, entry]) => {
      if (uuid === 'total') return;
      const node = nodeCache[uuid];
      const name = node?.name;
      if (!name) return;
      const counts = Object.values(entry)[0] || {};
      if (counts.over_exploited || counts.critical) {
        subIssues.push(`${name}: OE=${counts.over_exploited || 0}, CRIT=${counts.critical || 0}`);
      }
    });
  }
  return `Location: ${d.locationName}
GW AVAILABILITY:
  Total GW Availability: ${f(d.totalGWAvailability?.total)} ham
  Current Availability: ${f(d.currentAvailabilityForAllPurposes?.total)} ham
  Availability for Future Use: ${f(d.availabilityForFutureUse?.total)} ham
  Stage of Extraction (Total): ${f(d.stageOfExtraction?.total)}%
  Static GW Resource: ${f(d.staticGWResource?.total)} ham
DRAFT:
  Agriculture: ${f(d.draftData?.agriculture?.total)} ham
  Domestic: ${f(d.draftData?.domestic?.total)} ham
  Industry: ${f(d.draftData?.industry?.total)} ham
  Total: ${f(d.draftData?.total?.total)} ham
RECHARGE:
  Rainfall: ${f(d.rechargeData?.rainfall?.total)} ham
  Agriculture Return: ${f(d.rechargeData?.agriculture?.total)} ham
  Canal Seepage: ${f(d.rechargeData?.canal?.total)} ham
  Water Body: ${f(d.rechargeData?.water_body?.total)} ham
  Artificial Structures: ${f(d.rechargeData?.artificial_structure?.total)} ham
  Total Recharge: ${f(d.rechargeData?.total?.total)} ham
LOSSES: ${f(d.loss?.total)} ham
RAINFALL: ${f(d.rainfall?.total)} mm
SUB-REGION STRESS:\n${rsSummary || '  Not available'}
PROBLEM AREAS:\n${subIssues.length ? subIssues.slice(0, 10).join('\n') : '  None identified'}`;
}

export function buildSystemPrompt(activePath, activeData, selectedYear, nodeCache) {
  const locName = activePath[activePath.length - 1]?.name || 'INDIA';
  const dataStr = activeData ? buildDataContext(activeData, nodeCache) : 'No data loaded. Ask user to select a location.';
  const pathStr = activePath.map(p => p.name).join(' → ');
  return `You are an expert groundwater analyst for the INGRES portal (CGWB/IITH India).

CURRENT NAVIGATION PATH: ${pathStr}
SELECTED LOCATION: ${locName}
YEAR: ${selectedYear}

GROUNDWATER DATA:
${dataStr}

RULES:
- Be precise. Use actual data values from above.
- Use **bold** for key numbers/terms. Bullet points for lists.
- Units: ham = hectare-meters. 1 BCM = 100,000 ham. Convert for clarity.
- Stage of extraction: <70%=Safe, 70-90%=Semi-critical, 90-100%=Critical, >100%=Over-exploited
- If asked for charts/graphs, append this EXACTLY at the end of your response:
  CHART_JSON:{"type":"bar|pie|line|doughnut","title":"...","labels":[...],"datasets":[{"label":"...","data":[...],"color":"#hexcode"}]}
  For line charts showing trends, use multiple years as labels and include data for each.
  You may include up to 2 CHART_JSON blocks for complex questions.
- If data is unavailable for a metric, say so honestly.
- Keep responses clear and actionable. Max ~400 words.
- Do not use emojis anywhere in your response.`;
}

// ── Chart helpers ────────────────────────────────────────────────────────────

import { PALETTE } from './constants';
const FONT_MONO = "'Red Hat Text', monospace";

export function buildDatasets(cfg) {
  const isPie = cfg.type === 'pie' || cfg.type === 'doughnut';
  return cfg.datasets.map((ds, i) => {
    const base = ds.color || PALETTE[i % PALETTE.length];
    if (isPie) {
      return { label: ds.label, data: ds.data, backgroundColor: PALETTE.map(c => c + 'CC'), borderColor: '#fff', borderWidth: 2, hoverBorderWidth: 3, hoverOffset: 8 };
    }
    if (cfg.type === 'line') {
      return { label: ds.label, data: ds.data, borderColor: base, backgroundColor: base + '18', borderWidth: 2.5, pointBackgroundColor: '#fff', pointBorderColor: base, pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, pointHoverBackgroundColor: base, tension: 0.42, fill: true };
    }
    return { label: ds.label, data: ds.data, backgroundColor: base + 'CC', borderColor: base, borderWidth: 0, borderRadius: 6, borderSkipped: false, hoverBackgroundColor: base };
  });
}

export function buildChartOptions(cfg) {
  const isPie = cfg.type === 'pie' || cfg.type === 'doughnut';
  const base = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 500, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: true, position: isPie ? 'right' : 'bottom', labels: { color: '#6B6860', font: { family: FONT_MONO, size: 10 }, padding: 14, boxWidth: 9, boxHeight: 9, usePointStyle: true, pointStyle: 'circle' } },
      tooltip: {
        backgroundColor: '#1A1916EE', titleColor: '#E8E6E0', bodyColor: '#A8A5A0', padding: 11, cornerRadius: 7,
        titleFont: { family: FONT_MONO, size: 11, weight: 'bold' }, bodyFont: { family: FONT_MONO, size: 10 },
        borderColor: '#3A3835', borderWidth: 1,
        callbacks: { label: (ctx) => { const v = ctx.parsed?.y ?? ctx.parsed; return ` ${ctx.dataset.label || ctx.label}: ${typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v}`; } },
      },
    },
  };
  if (!isPie) {
    base.scales = {
      x: { grid: { color: '#E8E6E0', drawBorder: false }, ticks: { color: '#A8A5A0', font: { family: FONT_MONO, size: 9 }, maxRotation: 30 }, border: { display: false } },
      y: { grid: { color: '#E8E6E0', drawBorder: false }, ticks: { color: '#A8A5A0', font: { family: FONT_MONO, size: 9 } }, border: { display: false } },
    };
  }
  if (cfg.type === 'doughnut') { base.plugins.legend.position = 'right'; base.cutout = '62%'; }
  return base;
}

export function getRecommendedChartType(nLocations, nMetrics) {
  if (nLocations === 1) return { type: 'bar', reason: 'Bar chart is best for comparing metrics of a single location.' };
  if (nLocations === 2 && nMetrics === 1) return { type: 'bar', reason: 'Side-by-side bars clearly show the difference between two locations.' };
  if (nLocations >= 2 && nMetrics >= 3) return { type: 'bar', reason: 'Grouped bars work best when comparing multiple locations across multiple metrics.' };
  if (nLocations >= 2 && nMetrics === 1) return { type: 'doughnut', reason: 'A donut chart shows proportional share of a single metric across locations.' };
  return { type: 'bar', reason: 'Bar chart is the default for multi-location comparisons.' };
}
