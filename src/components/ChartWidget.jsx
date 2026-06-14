import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { PALETTE } from '../constants';
import { buildDatasets, buildChartOptions } from '../utils';

let chartIdCounter = 0;
const chartInstances = {};

export function ChartWidget({ cfg, height = 220 }) {
  const canvasRef = useRef(null);
  const idRef = useRef('chart_' + (++chartIdCounter));

  useEffect(() => {
    if (!canvasRef.current || !cfg) return;
    const id = idRef.current;
    if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    chartInstances[id] = new Chart(ctx, {
      type: cfg.type || 'bar',
      data: { labels: cfg.labels, datasets: buildDatasets(cfg) },
      options: buildChartOptions(cfg),
    });
    return () => {
      if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
    };
  }, [cfg]);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginTop: 10, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 3, height: 13, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
        {cfg.title || 'Chart'}
      </div>
      <div style={{ position: 'relative', height }}><canvas ref={canvasRef} /></div>
    </div>
  );
}

export function MultiColorBarChart({ cfg, height = 200 }) {
  const canvasRef = useRef(null);
  const idRef = useRef('chart_' + (++chartIdCounter));

  useEffect(() => {
    if (!canvasRef.current || !cfg) return;
    const id = idRef.current;
    if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const datasets = cfg.datasets.map((ds, di) => {
      const base = {
        label: ds.label,
        data: ds.data,
        borderWidth: 0,
        borderRadius: 7,
        borderSkipped: false,
      };
      if (ds._multiColor) {
        base.backgroundColor = PALETTE.map(c => c + 'CC');
        base.hoverBackgroundColor = PALETTE;
      } else {
        const color = ds.color || PALETTE[di % PALETTE.length];
        base.backgroundColor = color + 'CC';
        base.borderColor = color;
        base.hoverBackgroundColor = color;
      }
      return base;
    });

    chartInstances[id] = new Chart(ctx, {
      type: cfg.type || 'bar',
      data: { labels: cfg.labels, datasets },
      options: buildChartOptions(cfg),
    });
    return () => {
      if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
    };
  }, [cfg]);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 3, height: 13, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
        {cfg.title || 'Chart'}
      </div>
      <div style={{ position: 'relative', height }}><canvas ref={canvasRef} /></div>
    </div>
  );
}
