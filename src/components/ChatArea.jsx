import React, { useState, useRef, useCallback, useEffect } from 'react';
import StatsBar from './StatsBar';
import ChatMessage from './ChatMessage';
import { QUICK_PROMPTS } from '../constants';
import { buildSystemPrompt, parseReply } from '../utils';

export default function ChatArea({ groqKey, groqModel, activePath, activeData, selectedYear, nodeCache, locationName, onOpenSettings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setMessages([{
        id: Date.now(), role: 'bot',
        text: `**Welcome to INGRES Groundwater Intelligence**\n\nConnected to the CGWB/IITH data portal with full hierarchical navigation across India → State → District → Block.\n\nThe left panel lets you drill down to any administrative level. Click any state to expand it — districts load automatically.\n\n**What this system can analyse:**\n- Groundwater stress and extraction stages\n- Recharge source breakdowns\n- Draft by sector (agriculture, domestic, industry)\n- Over-exploited and critical zone identification\n- Charts and visualizations on demand\n- Year-over-year trend analysis\n\n*Select any location on the left, then ask about it.*`,
      }]);
    }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || busy) return;
    if (!groqKey) { onOpenSettings(); return; }
    addMessage({ role: 'user', text });
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setBusy(true);
    addMessage({ role: 'typing' });
    try {
      const sys = buildSystemPrompt(activePath, activeData, selectedYear, nodeCache);
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: groqModel, messages: [{ role: 'system', content: sys }, { role: 'user', content: text }], max_tokens: 1200, temperature: 0.25 }),
      });
      if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || `HTTP ${resp.status}`); }
      const j = await resp.json();
      const reply = j.choices[0].message.content;
      const { text: parsed, charts } = parseReply(reply);
      setMessages(prev => prev.filter(m => m.role !== 'typing'));
      addMessage({ role: 'bot', text: parsed, charts });
    } catch (e) {
      setMessages(prev => prev.filter(m => m.role !== 'typing'));
      addMessage({ role: 'bot', text: `Error: ${e.message}. Please check your API key.` });
    }
    setBusy(false);
  }, [busy, groqKey, groqModel, activePath, activeData, selectedYear, nodeCache, onOpenSettings, addMessage]);

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };
  const autoResize = (el) => { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <StatsBar activeData={activeData} locationName={locationName} />

      {/* Breadcrumb */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 16px', height: 30, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, overflowX: 'auto' }} className="hide-scroll">
        {activePath.map((item, i) => (
          <span key={item.uuid} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {i > 0 && <span style={{ color: 'var(--border-strong)', fontSize: 11 }}>›</span>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: i === activePath.length - 1 ? 'var(--text-secondary)' : 'var(--accent)', cursor: i < activePath.length - 1 ? 'pointer' : 'default', letterSpacing: '.04em' }}>{item.name}</span>
          </span>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 12px', display: 'flex', flexDirection: 'column', gap: 14 }} className="thin-scroll">
        {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        {QUICK_PROMPTS.map(qp => (
          <button
            key={qp.label}
            onClick={() => sendMessage(qp.text)}
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: 10.5, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all .12s', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
        <div
          style={{ flex: 1, background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', padding: '2px 2px 2px 13px', transition: 'border-color var(--transition)' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(e.target); }}
            onKeyDown={handleKey}
            placeholder="Ask anything about groundwater in the selected location…"
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 13, resize: 'none', minHeight: 36, maxHeight: 120, lineHeight: 1.55, padding: '6px 0' }}
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={busy || !input.trim()}
          style={{ width: 36, height: 36, background: busy || !input.trim() ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: 8, cursor: busy || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all var(--transition)', color: busy || !input.trim() ? 'var(--text-muted)' : '#fff', boxShadow: busy || !input.trim() ? 'none' : '0 3px 10px rgba(26,74,138,0.3)' }}
          onMouseEnter={e => { if (!busy && input.trim()) e.currentTarget.style.background = 'var(--accent-light)'; }}
          onMouseLeave={e => { if (!busy && input.trim()) e.currentTarget.style.background = 'var(--accent)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  );
}
