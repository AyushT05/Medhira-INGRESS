import React, { useState, useCallback } from 'react';
import { PALETTE, YEARS, METRICS, CHART_TYPES_INFO } from '../constants';
import { fetchForYear, getRecommendedChartType } from '../utils';
import { MultiColorBarChart } from './ChartWidget';
import { INDIA_UUID } from '../constants';

function Slot({ slot, index, cache, onSelectLocation, onSelectYear, onRemove, compData, loading }) {
  const color = PALETTE[index % PALETTE.length];
  return (
    <div style={{ background: 'var(--surface)', border: `1.5px solid ${color}33`, borderRadius: 10, padding: '14px 14px 12px', position: 'relative', minWidth: 0 }}>
      <div style={{ position: 'absolute', top: -9, left: 12, background: color, color: '#fff', borderRadius: 20, fontSize: 8.5, fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 9px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Location {index + 1}</div>
      <button onClick={() => onRemove(index)} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</button>
      <div style={{ marginTop: 8, marginBottom: 10 }}>
        <label style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.07em', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Location</label>
        <div style={{ position: 'relative' }}>
          <input
            value={slot.locationSearch || ''}
            onChange={e => onSelectLocation(index, 'search', e.target.value)}
            placeholder="Type to search…"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', transition: 'border-color var(--transition)' }}
            onFocus={e => e.target.style.borderColor = color}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; setTimeout(() => onSelectLocation(index, 'closeDropdown'), 200); }}
          />
          {slot.locationSearch && !slot.locationUuid && (() => {
            const q = slot.locationSearch.toLowerCase();
            const results = Object.entries(cache).filter(([, n]) => n?.name?.toLowerCase().includes(q) && n?.name !== 'INDIA').slice(0, 6);
            if (!results.length) return null;
            return (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow)', maxHeight: 180, overflowY: 'auto', marginTop: 3 }}>
                {results.map(([uuid, node]) => (
                  <button
                    key={uuid}
                    onMouseDown={() => onSelectLocation(index, 'pick', { uuid, name: node.name, loctype: node.loctype })}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.name}</div>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.04em' }}>{node.loctype}</div>
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
        {slot.locationName && <div style={{ fontSize: 9.5, color, fontFamily: 'var(--font-mono)', marginTop: 4, fontWeight: 700, letterSpacing: '.02em' }}>✓ {slot.locationName}</div>}
      </div>
      <div>
        <label style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.07em', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Year</label>
        <select
          value={slot.year}
          onChange={e => onSelectYear(index, e.target.value)}
          style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {loading && <div style={{ marginTop: 8, fontSize: 9.5, color: 'var(--accent)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 5 }}><span className="spin-icon" /> Loading data…</div>}
      {compData && !loading && <div style={{ marginTop: 8, fontSize: 9.5, color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Data loaded</div>}
    </div>
  );
}

export default function ComparisonPanel({ cache, loadNode, onHighlightLocations }) {
  const [slots, setSlots] = useState([
    { locationSearch: '', locationUuid: null, locationName: null, loctype: null, year: '2024-2025' },
    { locationSearch: '', locationUuid: null, locationName: null, loctype: null, year: '2024-2025' },
  ]);
  const [compData, setCompData] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedMetrics, setSelectedMetrics] = useState(['stage', 'availability', 'draft']);
  const [chartType, setChartType] = useState('bar');
  const [isRunning, setIsRunning] = useState(false);

  const readySlots = slots.filter(s => s.locationUuid);
  const rec = getRecommendedChartType(readySlots.length, selectedMetrics.length);

  const handleSelectLocation = useCallback((index, action, value) => {
    setSlots(prev => {
      const next = [...prev];
      if (action === 'search') next[index] = { ...next[index], locationSearch: value, locationUuid: null, locationName: null };
      else if (action === 'pick') next[index] = { ...next[index], locationSearch: value.name, locationUuid: value.uuid, locationName: value.name, loctype: value.loctype };
      else if (action === 'closeDropdown') { if (!next[index].locationUuid) next[index] = { ...next[index], locationSearch: next[index].locationName || '' }; }
      return next;
    });
  }, []);

  const handleSelectYear = useCallback((index, year) => {
    setSlots(prev => { const next = [...prev]; next[index] = { ...next[index], year }; return next; });
  }, []);

  const handleRemove = useCallback((index) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
    setCompData(prev => { const next = { ...prev }; delete next[index]; return next; });
  }, []);

  const runComparison = async () => {
    if (readySlots.length < 1) return;
    setIsRunning(true);
    const newData = {};
    const newLoading = {};
    readySlots.forEach((_, i) => { newLoading[i] = true; });
    setLoading(newLoading);
    for (let i = 0; i < readySlots.length; i++) {
      const slot = readySlots[i];
      try {
        const node = cache[slot.locationUuid];
        const pUuid = node?.parentUuid || INDIA_UUID;
        const pName = node?.parentName || 'INDIA';
        const data = await fetchForYear(slot.locationUuid, slot.locationName, slot.loctype, pUuid, pName, slot.year, cache);
        newData[i] = data;
      } catch (e) { newData[i] = null; }
      setLoading(prev => { const next = { ...prev }; delete next[i]; return next; });
    }
    setCompData(newData);
    setIsRunning(false);
    const names = readySlots.map(s => s.locationName).filter(Boolean);
    onHighlightLocations(names, true);
  };

  const buildCharts = () => {
    if (!readySlots.length || !Object.keys(compData).length) return [];
    const colors = PALETTE;
    if (chartType === 'doughnut' || chartType === 'pie') {
      return selectedMetrics.slice(0, 1).map(metricKey => {
        const metric = METRICS.find(m => m.key === metricKey);
        if (!metric) return null;
        const labels = readySlots.map(s => `${s.locationName} (${s.year})`);
        const vals = readySlots.map((_, i) => metric.get(compData[i]));
        return { type: chartType, title: `${metric.label} (${metric.unit}) — Proportional Share`, labels, datasets: [{ label: metric.label, data: vals }] };
      }).filter(Boolean);
    }
    if (chartType === 'line') {
      const metricObjs = selectedMetrics.map(k => METRICS.find(m => m.key === k)).filter(Boolean);
      return [{
        type: 'line',
        title: 'Multi-metric Profile Comparison',
        labels: metricObjs.map(m => m.label),
        datasets: readySlots.map((s, i) => ({
          label: `${s.locationName} (${s.year})`,
          data: metricObjs.map(m => m.get(compData[i])),
          color: colors[i % colors.length],
        })),
      }];
    }
    return selectedMetrics.map(metricKey => {
      const metric = METRICS.find(m => m.key === metricKey);
      if (!metric) return null;
      return {
        type: 'bar',
        title: `${metric.label} (${metric.unit})`,
        labels: readySlots.map(s => s.locationName),
        datasets: [{
          label: metric.label,
          data: readySlots.map((_, i) => metric.get(compData[i])),
          color: '#1A4A8A',
          _multiColor: true,
        }],
      };
    }).filter(Boolean);
  };

  const buildTable = () => {
    if (!readySlots.length || !Object.keys(compData).length) return null;
    return (
      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.07em', fontWeight: 700, borderBottom: '1.5px solid var(--border)' }}>METRIC</th>
              {readySlots.map((s, i) => (
                <th key={i} style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 9, color: PALETTE[i % PALETTE.length], letterSpacing: '.05em', fontWeight: 700, borderBottom: '1.5px solid var(--border)' }}>
                  {s.locationName}<br /><span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{s.year}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map(m => (
              <tr key={m.key} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '7px 12px', fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-secondary)', fontWeight: 600 }}>{m.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({m.unit})</span></td>
                {readySlots.map((_, i) => {
                  const val = m.get(compData[i]);
                  return <td key={i} style={{ padding: '7px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>{val ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const charts = buildCharts();

  return (
    <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, background: 'var(--bg)' }} className="thin-scroll">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-.02em' }}>Comparison</div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>Compare groundwater metrics across locations and years.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
        {slots.map((slot, i) => (
          <Slot key={i} slot={slot} index={i} cache={cache} onSelectLocation={handleSelectLocation} onSelectYear={handleSelectYear} onRemove={handleRemove} compData={compData[i]} loading={!!loading[i]} />
        ))}
        {slots.length < 4 && (
          <button
            onClick={() => setSlots(prev => [...prev, { locationSearch: '', locationUuid: null, locationName: null, loctype: null, year: '2024-2025' }])}
            style={{ background: 'var(--surface)', border: '1.5px dashed var(--border-strong)', borderRadius: 10, padding: 14, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', transition: 'all var(--transition)', minHeight: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '.02em' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Location
          </button>
        )}
      </div>

      {/* Controls */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.08em', marginBottom: 8, textTransform: 'uppercase' }}>Metrics to Compare</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {METRICS.map(m => {
                const active = selectedMetrics.includes(m.key);
                return (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMetrics(prev => prev.includes(m.key) ? prev.filter(k => k !== m.key) : [...prev, m.key])}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all var(--transition)', background: active ? 'var(--accent-bg)' : 'var(--surface-2)', border: active ? '1.5px solid var(--accent-border)' : '1.5px solid var(--border)', color: active ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: active ? 700 : 400, letterSpacing: '.02em' }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.08em', marginBottom: 8, textTransform: 'uppercase' }}>Chart Type</div>
            <div style={{ display: 'flex', gap: 5 }}>
              {Object.entries(CHART_TYPES_INFO).map(([t, info]) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  title={info.hint}
                  style={{ padding: '5px 12px', borderRadius: 7, fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all var(--transition)', background: chartType === t ? 'var(--accent)' : 'var(--surface-2)', border: chartType === t ? '1.5px solid var(--accent)' : '1.5px solid var(--border)', color: chartType === t ? '#fff' : 'var(--text-secondary)', fontWeight: chartType === t ? 700 : 400 }}
                >
                  {info.label}
                </button>
              ))}
            </div>
            {readySlots.length >= 1 && (
              <div style={{ marginTop: 7, fontSize: 9.5, color: 'var(--teal)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {rec.reason}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={runComparison}
            disabled={readySlots.length < 1 || isRunning}
            style={{ padding: '9px 22px', background: readySlots.length < 1 ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: 7, color: readySlots.length < 1 ? 'var(--text-muted)' : '#fff', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, cursor: readySlots.length < 1 ? 'not-allowed' : 'pointer', transition: 'all var(--transition)', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '.03em' }}
            onMouseEnter={e => { if (readySlots.length >= 1 && !isRunning) e.currentTarget.style.background = 'var(--accent-light)'; }}
            onMouseLeave={e => { if (readySlots.length >= 1) e.currentTarget.style.background = 'var(--accent)'; }}
          >
            {isRunning ? <><span className="spin-icon" /> Running…</> : 'Run Comparison'}
          </button>
        </div>
      </div>

      {charts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 16 }}>
          {charts.map((cfg, i) => <MultiColorBarChart key={i} cfg={cfg} height={200} />)}
        </div>
      )}

      {Object.keys(compData).length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 3, height: 13, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
            Full Metrics Table
          </div>
          {buildTable()}
        </div>
      )}

      {readySlots.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          </div>
          Select at least one location above, then click Run Comparison
        </div>
      )}
    </div>
  );
}
