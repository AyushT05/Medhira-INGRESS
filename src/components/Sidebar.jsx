import React, { useState, useMemo } from 'react';
import { INDIA_UUID, BADGE_CFG } from '../constants';
import { getChildBadge } from '../utils';

function TreeNode({ uuid, depth, cache, activeUuid, onSelect, onToggle, comparisonUuids }) {
  const node = cache[uuid];
  if (!node) return null;
  const isActive = activeUuid === uuid;
  const isInComparison = comparisonUuids.includes(uuid);
  const hasChildren = node.childUuids === null || (node.childUuids && node.childUuids.length > 0);
  const isExpanded = node.expanded;

  let badge = null;
  if (node.parentUuid && cache[node.parentUuid]?.data?.reportSummary) {
    const rs = cache[node.parentUuid].data.reportSummary;
    const stressType = getChildBadge(rs[uuid]);
    if (stressType && BADGE_CFG[stressType]) {
      const s = BADGE_CFG[stressType];
      badge = (
        <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '1px 5px', borderRadius: 3, letterSpacing: '.04em', background: s.bg, color: s.color, border: `1px solid ${s.border}`, flexShrink: 0 }}>
          {s.label}
        </span>
      );
    }
  }

  const sortedChildren = useMemo(() => {
    if (!node.childUuids) return [];
    return [...node.childUuids].sort((a, b) => (cache[a]?.name || '').localeCompare(cache[b]?.name || ''));
  }, [node.childUuids, cache]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '1px 0' }}>
        <div
          onClick={e => { e.stopPropagation(); if (hasChildren) onToggle(uuid); }}
          style={{ width: 20, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: hasChildren ? 'pointer' : 'default', color: hasChildren ? 'var(--text-muted)' : 'var(--border)', fontSize: 8, flexShrink: 0, borderRadius: 4, transition: 'color var(--transition)', userSelect: 'none' }}
          onMouseEnter={e => { if (hasChildren) e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = hasChildren ? 'var(--text-muted)' : 'var(--border)'; }}
        >
          {hasChildren ? (isExpanded ? '▾' : '▸') : '·'}
        </div>
        <button
          onClick={() => onSelect(uuid, node.name, node.loctype)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px 4px 2px', background: isActive ? 'var(--accent-bg)' : isInComparison ? '#FEF9C3' : 'transparent', border: isActive ? '1px solid var(--accent-border)' : isInComparison ? '1px solid #FDE68A' : '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11.5, color: isActive ? 'var(--accent)' : 'var(--text-secondary)', textAlign: 'left', transition: 'all .1s', minWidth: 0, fontWeight: isActive ? 600 : 400 }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { if (!isActive && !isInComparison) e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name || uuid.slice(0, 8) + '…'}</span>
          {badge}
        </button>
      </div>
      {isExpanded && (
        <div style={{ paddingLeft: 18, borderLeft: '1px solid var(--border)', marginLeft: 10 }}>
          {node.childUuids === null ? (
            <div style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}><span className="spin-icon" />Loading</div>
          ) : node.childUuids.length === 0 ? (
            <div style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>No sub-units</div>
          ) : !sortedChildren.every(u => cache[u]?.name) ? (
            <div style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}><span className="spin-icon" />Discovering</div>
          ) : (
            sortedChildren.map(childUuid =>
              cache[childUuid] ? (
                <TreeNode key={childUuid} uuid={childUuid} depth={depth + 1} cache={cache} activeUuid={activeUuid} onSelect={onSelect} onToggle={onToggle} comparisonUuids={comparisonUuids} />
              ) : null
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ cache, activeUuid, onSelect, onToggle, comparisonUuids = [] }) {
  const [search, setSearch] = useState('');
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return Object.entries(cache).filter(([, n]) => n?.name?.toLowerCase().includes(q)).slice(0, 20);
  }, [search, cache]);

  return (
    <div style={{ width: 'var(--sidebar-w)', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '12px 10px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Location Explorer</div>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search locations…"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px 7px 28px', color: 'var(--text-primary)', fontSize: 11.5, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', transition: 'border-color var(--transition)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }} className="thin-scroll">
        {searchResults ? (
          searchResults.map(([uuid, node]) => (
            <button
              key={uuid}
              onClick={() => { setSearch(''); onSelect(uuid, node.name, node.loctype); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', background: activeUuid === uuid ? 'var(--accent-bg)' : 'transparent', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', transition: 'background .1s', marginBottom: 2 }}
              onMouseEnter={e => { if (activeUuid !== uuid) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (activeUuid !== uuid) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.name}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1, letterSpacing: '.04em' }}>{node.loctype}</div>
            </button>
          ))
        ) : (
          <TreeNode uuid={INDIA_UUID} depth={0} cache={cache} activeUuid={activeUuid} onSelect={onSelect} onToggle={onToggle} comparisonUuids={comparisonUuids} />
        )}
      </div>
    </div>
  );
}
