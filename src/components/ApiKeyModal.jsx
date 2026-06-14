import React, { useState } from 'react';
import { GROQ_MODELS } from '../constants';

export default function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!key.startsWith('gsk_') && !key.startsWith('gsk-')) {
      setError('Invalid key format. Groq keys begin with gsk_');
      return;
    }
    onSave(key, model);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(245,244,240,0.92)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, width: 420, maxWidth: '92vw', boxShadow: 'var(--shadow-lg)', animation: 'fadeUp .3s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-.01em' }}>INGRES Intelligence</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '.04em' }}>GROUNDWATER ANALYSIS PLATFORM</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.65 }}>
          Connect your Groq API key to enable AI-powered groundwater analysis.{' '}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>Get a free key</a>
        </p>

        <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.08em', marginBottom: 6 }}>API KEY</label>
        <input
          type="password"
          value={key}
          onChange={e => { setKey(e.target.value); setError(''); }}
          placeholder="gsk_••••••••••••••••••••••••"
          style={{ width: '100%', background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 13px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none', marginBottom: 14, boxSizing: 'border-box', transition: 'border-color var(--transition)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />

        <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.08em', marginBottom: 6 }}>MODEL</label>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          style={{ width: '100%', background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 13px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 11, outline: 'none', cursor: 'pointer', marginBottom: error ? 12 : 20 }}
        >
          {GROQ_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        {error && <p style={{ fontSize: 11, color: 'var(--red)', marginBottom: 14, fontFamily: 'var(--font-mono)' }}>{error}</p>}

        <button
          onClick={handleSave}
          style={{ width: '100%', padding: 12, background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '-.01em', transition: 'background var(--transition)' }}
          onMouseEnter={e => e.target.style.background = 'var(--accent-light)'}
          onMouseLeave={e => e.target.style.background = 'var(--accent)'}
        >
          Connect to INGRES
        </button>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 12, fontFamily: 'var(--font-mono)', textAlign: 'center', letterSpacing: '.03em' }}>Key stored locally in your browser only</p>
      </div>
    </div>
  );
}
