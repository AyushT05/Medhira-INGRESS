import React from 'react';
import { fmtHam } from '../utils';

function StatItem({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 18px', borderRight: '1px solid var(--border)', flexShrink: 0, gap: 1 }}>
      <div style={{ fontSize: 8.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: color || 'var(--accent)', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

export default function StatsBar({ activeData, locationName }) {
  const d = activeData;
  const stage = d?.stageOfExtraction?.total || 0;
  const stageColor = stage > 100 ? 'var(--red)' : stage > 90 ? 'var(--amber)' : stage > 70 ? '#92680A' : 'var(--teal)';
  return (
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', overflowX: 'auto', flexShrink: 0, height: 'var(--stats-h)' }} className="hide-scroll">
      <StatItem label="Location" value={locationName ? (locationName.length > 16 ? locationName.slice(0, 16) + '…' : locationName) : 'INDIA'} color="var(--text-primary)" />
      <StatItem label="Extraction Stage" value={d ? stage.toFixed(1) + '%' : '—'} color={d ? stageColor : 'var(--text-muted)'} />
      <StatItem label="GW Availability" value={d ? fmtHam(d.totalGWAvailability?.total) : '—'} color="var(--accent)" />
      <StatItem label="Annual Rainfall" value={d ? (d.rainfall?.total || 0).toFixed(0) + ' mm' : '—'} color="var(--teal)" />
      <StatItem label="Total Draft" value={d ? fmtHam(d.draftData?.total?.total) : '—'} color="#7C3AED" />
      <StatItem label="Future Avail." value={d ? fmtHam(d.availabilityForFutureUse?.total) : '—'} color="var(--green)" />
      <StatItem label="Recharge Total" value={d ? fmtHam(d.rechargeData?.total?.total) : '—'} color="var(--teal)" />
    </div>
  );
}
