import React from 'react';
import { ChartWidget } from './ChartWidget';
import { mdToHtml } from '../utils';

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', animation: 'fadeUp .2s ease-out' }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, background: isUser ? 'var(--accent-bg)' : 'var(--surface-2)', border: isUser ? '1px solid var(--accent-border)' : '1px solid var(--border)', color: isUser ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '.04em' }}>
        {isUser ? (
          'YOU'
        ) : (
          <img src="MedhiraDP.png" alt="Medhira" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
        )}
      </div>
      <div style={{ maxWidth: '78%', padding: '11px 14px', borderRadius: 11, fontSize: 13, lineHeight: 1.7, background: isUser ? 'var(--accent-bg)' : 'var(--surface)', border: isUser ? '1px solid var(--accent-border)' : '1px solid var(--border)', borderTopLeftRadius: isUser ? 11 : 3, borderTopRightRadius: isUser ? 3 : 11, color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}>
        {msg.role === 'typing' ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '3px 0' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite` }} />
            ))}
          </div>
        ) : (
          <>
            <div className="msg-content" dangerouslySetInnerHTML={{ __html: mdToHtml(msg.text || '') }} />
            {msg.charts?.map((cfg, i) => <ChartWidget key={i} cfg={cfg} height={210} />)}
          </>
        )}
      </div>
    </div>
  );
}
