import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import {
  STATE_COORDS, STATE_SIZE, PALETTE,
  MAP_ACCENT, MAP_OCEAN, MAP_LAND, MAP_BORDER, MAP_BORDER_HL,
  INDIA_GEOJSON_URL, SVG_W, SVG_H,
} from '../constants';

// Module-level GeoJSON cache so it's fetched only once
let _geoCache = null;
let _geoPromise = null;
function fetchIndiaGeo() {
  if (_geoCache) return Promise.resolve(_geoCache);
  if (_geoPromise) return _geoPromise;
  _geoPromise = fetch(INDIA_GEOJSON_URL)
    .then(r => r.json())
    .then(data => { _geoCache = data; return data; });
  return _geoPromise;
}

function buildProjection(geojson) {
  return d3.geoMercator().fitSize([SVG_W, SVG_H], geojson);
}

function MapSVG({ dots, comparisonMode, tooltip, setTooltip }) {
  const [geo, setGeo] = useState(null);
  const [projFn, setProjFn] = useState(null);
  const [projectedDots, setProjectedDots] = useState([]);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    fetchIndiaGeo()
      .then(data => {
        setGeo(data);
        const proj = buildProjection(data);
        setProjFn(() => proj);
      })
      .catch(() => setGeoError(true));
  }, []);

  useEffect(() => {
    if (!projFn) return;
    setProjectedDots(dots.map(d => {
      const coords = STATE_COORDS[d.name];
      if (!coords) return { ...d, px: null, py: null };
      const [px, py] = projFn([coords.lng, coords.lat]);
      return { ...d, px, py };
    }));
  }, [projFn, dots]);

  const pathGen = projFn ? d3.geoPath().projection(projFn) : null;
  const normName = n => (n || '').toUpperCase().trim();
  const hlNames = dots.filter(d => d.isHighlighted).map(d => d.name);

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: '100%', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill={MAP_OCEAN} />

      {geo && pathGen && geo.features.map((feat, i) => {
        const sname = normName(feat.properties?.NAME_1 || feat.properties?.ST_NM || feat.properties?.name || '');
        const isHl = hlNames.includes(sname);
        return (
          <path
            key={i}
            d={pathGen(feat)}
            fill={isHl ? '#D4E4F7' : MAP_LAND}
            stroke={isHl ? MAP_BORDER_HL : MAP_BORDER}
            strokeWidth={isHl ? 1.2 : 0.6}
            style={{ transition: 'fill 0.2s' }}
          />
        );
      })}

      {!geo && !geoError && (
        <text x={SVG_W / 2} y={SVG_H / 2} textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="monospace">Loading map…</text>
      )}
      {geoError && (
        <text x={SVG_W / 2} y={SVG_H / 2} textAnchor="middle" fill="#C02A2A" fontSize="11" fontFamily="monospace">Map unavailable</text>
      )}

      {/* Comparison connector lines */}
      {comparisonMode && projectedDots.filter(d => d.isHighlighted && d.px).length >= 2 && (() => {
        const hl = projectedDots.filter(d => d.isHighlighted && d.px);
        return hl.slice(0, -1).map((_, i) => (
          <line key={i} x1={hl[i].px} y1={hl[i].py} x2={hl[i + 1].px} y2={hl[i + 1].py}
            stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,5" opacity="0.7" />
        ));
      })()}

      {/* Non-highlighted dots */}
      {projectedDots.filter(d => !d.isHighlighted && d.px).map(({ name, px, py, sz }) => (
        <g key={name} onMouseEnter={() => setTooltip({ name, x: px, y: py })} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}>
          <circle cx={px} cy={py} r={sz * 0.28} fill="#B5CCDA" stroke="#96B6C8" strokeWidth="0.7" />
        </g>
      ))}

      {/* Highlighted dots */}
      {projectedDots.filter(d => d.isHighlighted && d.px).map(({ name, px, py, sz, hlColor }, i) => (
        <g key={name} onMouseEnter={() => setTooltip({ name, x: px, y: py })} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}>
          <circle cx={px} cy={py} r={sz * 0.75} fill={hlColor} opacity="0.12" />
          <circle cx={px} cy={py} r={sz * 0.75} fill="none" stroke={hlColor} strokeWidth="1.5" opacity="0.3">
            <animate attributeName="r" values={`${sz * 0.6};${sz * 1.0};${sz * 0.6}`} dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={px} cy={py} r={sz * 0.46} fill={hlColor} stroke="#FFFFFF" strokeWidth="2" />
          {comparisonMode && (
            <text x={px} y={py + 1} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="monospace">{i + 1}</text>
          )}
        </g>
      ))}

      {/* Tooltip */}
      {tooltip && (() => {
        const tx = Math.min(tooltip.x + 12, SVG_W - 80);
        const ty = Math.max(tooltip.y - 20, 14);
        const w = tooltip.name.length * 5.5 + 18;
        return (
          <g>
            <rect x={tx} y={ty - 12} width={w} height={20} fill="#1A1916" rx="4" opacity="0.9" />
            <text x={tx + 9} y={ty + 3} fill="#F5F4F0" fontSize="9.5" fontFamily="monospace">{tooltip.name}</text>
          </g>
        );
      })()}
    </svg>
  );
}

export default function IndiaMap({ highlightedLocations = [], comparisonMode }) {
  const [tooltip, setTooltip] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const hlNames = highlightedLocations.map(l => l.toUpperCase());

  const dots = Object.entries(STATE_COORDS).map(([name]) => {
    const isHighlighted = hlNames.includes(name);
    const hlIdx = hlNames.indexOf(name);
    const sz = STATE_SIZE[name] || STATE_SIZE.DEFAULT;
    const hlColor = comparisonMode ? (PALETTE[hlIdx] || PALETTE[0]) : MAP_ACCENT;
    return { name, sz, isHighlighted, hlColor };
  });

  if (expanded) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,22,0.72)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', width: '80vw', maxWidth: 740, height: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeUp .2s ease-out' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E8E6E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, fontFamily: 'Red Hat Display, sans-serif', fontWeight: 700, color: '#1A1916', letterSpacing: '-.01em' }}>India — Groundwater Map</span>
              {hlNames.length > 0 && <span style={{ fontSize: 9.5, fontFamily: 'monospace', color: MAP_ACCENT, background: '#EEF3FA', padding: '2px 9px', borderRadius: 10, border: '1px solid #C4D4EC' }}>{hlNames.length} location{hlNames.length > 1 ? 's' : ''} selected</span>}
            </div>
            <button onClick={() => setExpanded(false)} style={{ background: '#F5F4F0', border: '1px solid #E8E6E0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6860', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ flex: 1, position: 'relative', padding: 16, minHeight: 0 }}>
            <MapSVG dots={dots} comparisonMode={comparisonMode} tooltip={tooltip} setTooltip={setTooltip} />
          </div>
          {hlNames.length > 0 && (
            <div style={{ padding: '10px 18px', borderTop: '1px solid #E8E6E0', display: 'flex', flexWrap: 'wrap', gap: '5px 16px', flexShrink: 0 }}>
              {highlightedLocations.map((loc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: comparisonMode ? PALETTE[i] : MAP_ACCENT }} />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6B6860' }}>{comparisonMode ? `${i + 1}. ` : ''}{loc.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', background: '#FFFFFF', borderLeft: '1px solid #E8E6E0', width: '230px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '9px 11px 8px', borderBottom: '1px solid #E8E6E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#A8A5A0', letterSpacing: '.1em', textTransform: 'uppercase' }}>India Map</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {hlNames.length > 0 && (
            <span style={{ fontSize: 8.5, fontFamily: 'monospace', color: MAP_ACCENT, background: '#EEF3FA', padding: '1px 6px', borderRadius: 9, border: '1px solid #C4D4EC' }}>{hlNames.length} selected</span>
          )}
          <button
            onClick={() => setExpanded(true)}
            title="Expand map"
            style={{ background: 'transparent', border: '1px solid #E8E6E0', borderRadius: 5, width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A5A0', flexShrink: 0, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EEF3FA'; e.currentTarget.style.color = MAP_ACCENT; e.currentTarget.style.borderColor = '#C4D4EC'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A8A5A0'; e.currentTarget.style.borderColor = '#E8E6E0'; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <MapSVG dots={dots} comparisonMode={comparisonMode} tooltip={tooltip} setTooltip={setTooltip} />
      </div>

      {hlNames.length > 0 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #E8E6E0', flexShrink: 0 }}>
          {highlightedLocations.slice(0, 4).map((loc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < Math.min(highlightedLocations.length, 4) - 1 ? 4 : 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: comparisonMode ? PALETTE[i] : MAP_ACCENT, flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#6B6860', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comparisonMode ? `${i + 1}. ` : ''}{loc.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
      {hlNames.length === 0 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #E8E6E0' }}>
          <p style={{ fontSize: 9, fontFamily: 'monospace', color: '#A8A5A0', lineHeight: 1.7, margin: 0 }}>Select a location to highlight.</p>
        </div>
      )}
    </div>
  );
}
