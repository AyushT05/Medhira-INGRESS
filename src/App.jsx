import React, { useState, useEffect, useCallback } from 'react';
import { INDIA_UUID } from './constants';
import { useNodeCache } from './hooks/useNodeCache';
import ApiKeyModal from './components/ApiKeyModal';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ComparisonPanel from './components/ComparisonPanel';
import IndiaMap from './components/IndiaMap';

function inferStateName(activePath) {
  if (!activePath || activePath.length < 2) return null;
  const stateItem = activePath.find(p => p.loctype === 'STATE');
  return stateItem?.name || null;
}

export default function App() {
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('groq_key') || '');
  const [groqModel, setGroqModel] = useState(() => localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile');
  const [showModal, setShowModal] = useState(() => !localStorage.getItem('groq_key'));
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [activePath, setActivePath] = useState([{ uuid: INDIA_UUID, name: 'INDIA', loctype: 'COUNTRY' }]);
  const [activeData, setActiveData] = useState(null);
  const [tab, setTab] = useState('chat');
  const [mapHighlights, setMapHighlights] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const { cache, toggleExpand, loadNode, clearDataCache } = useNodeCache(selectedYear);

  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
    setActiveData(null);
    clearDataCache();
  }, [clearDataCache]);

  const handleSaveKey = useCallback((key, model) => {
    setGroqKey(key);
    setGroqModel(model);
    localStorage.setItem('groq_key', key);
    localStorage.setItem('groq_model', model);
    setShowModal(false);
  }, []);

  const buildPath = useCallback((uuid) => {
    const path = [];
    let cur = uuid;
    while (cur) {
      const n = cache[cur];
      if (!n) break;
      path.unshift({ uuid: cur, name: n.name, loctype: n.loctype });
      cur = n.parentUuid;
    }
    return path;
  }, [cache]);

  const handleSelectLocation = useCallback(async (uuid, name, loctype) => {
    const path = buildPath(uuid);
    setActivePath(path);
    const stateName = inferStateName(path);
    setMapHighlights(stateName ? [stateName] : []);
    setComparisonMode(false);
    const node = cache[uuid];
    if (node?.data) { setActiveData(node.data); return; }
    try {
      const data = await loadNode(uuid, name, loctype);
      setActiveData(data);
    } catch (e) { /* ignore */ }
  }, [buildPath, cache, loadNode]);

  const handleHighlightLocations = useCallback((names, isComparison) => {
    setMapHighlights(names);
    setComparisonMode(isComparison);
  }, []);

  const activeUuid = activePath[activePath.length - 1]?.uuid;

  const didMount = React.useRef(false);
  // Auto-fetch India data on first load
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    loadNode(INDIA_UUID, 'INDIA', 'COUNTRY')
      .then(data => { if (data) setActiveData(data); })
      .catch(() => {});
  });

  // Sync activeData when cache updates (e.g. after year change)
  useEffect(() => {
    if (activeUuid && cache[activeUuid]?.data) {
      setActiveData(cache[activeUuid].data);
    }
  }, [cache, activeUuid]);

  const locationName = activePath[activePath.length - 1]?.name || 'INDIA';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {showModal && <ApiKeyModal onSave={handleSaveKey} />}
      <Header selectedYear={selectedYear} onYearChange={handleYearChange} onOpenSettings={() => setShowModal(true)} />

      {/* Tabs */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 20px', display: 'flex', gap: 0, flexShrink: 0, height: 'var(--tabs-h)', alignItems: 'stretch' }}>
        {[{ id: 'chat', label: 'Chat' }, { id: 'compare', label: 'Compare' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ padding: '0 18px', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent', color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', transition: 'all var(--transition)', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '.04em' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar cache={cache} activeUuid={activeUuid} onSelect={handleSelectLocation} onToggle={toggleExpand} comparisonUuids={[]} />
        {tab === 'chat' ? (
          <ChatArea
            groqKey={groqKey}
            groqModel={groqModel}
            activePath={activePath}
            activeData={activeData}
            selectedYear={selectedYear}
            nodeCache={cache}
            locationName={locationName}
            onOpenSettings={() => setShowModal(true)}
          />
        ) : (
          <ComparisonPanel cache={cache} loadNode={loadNode} onHighlightLocations={handleHighlightLocations} />
        )}
        <IndiaMap highlightedLocations={mapHighlights} comparisonMode={comparisonMode} />
      </div>
    </div>
  );
}
