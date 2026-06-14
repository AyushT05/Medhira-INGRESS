import { useState, useRef, useCallback } from 'react';
import {
  INDIA_UUID, KNOWN_STATES, CHILD_LOCTYPE,
} from '../constants';
import {
  fetchNode, getSummaryRecord, getChildRecords,
  extractChildUuids, inferChildLoctype,
} from '../utils';

function loadInitialCache() {
  try {
    const cached = sessionStorage.getItem('nodeCache');
    if (cached) return JSON.parse(cached);
  } catch (e) { /* ignore */ }
  const cache = {};
  cache[INDIA_UUID] = {
    name: 'INDIA', loctype: 'COUNTRY', parentUuid: null, parentName: null,
    childUuids: Object.values(KNOWN_STATES), expanded: false, data: null,
  };
  Object.entries(KNOWN_STATES).forEach(([name, uuid]) => {
    cache[uuid] = {
      name, loctype: 'STATE', parentUuid: INDIA_UUID, parentName: 'INDIA',
      childUuids: null, expanded: false, data: null,
    };
  });
  return cache;
}

export function useNodeCache(selectedYear) {
  const [cache, setCache] = useState(loadInitialCache);
  const cacheRef = useRef(cache);

  const persistAndUpdate = useCallback((updater) => {
    setCache(prev => {
      const next = updater(prev);
      cacheRef.current = next;
      try { sessionStorage.setItem('nodeCache', JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, []);

  const getNode = useCallback((uuid) => cacheRef.current[uuid], []);

  const toggleExpand = useCallback(async (uuid) => {
    const node = cacheRef.current[uuid];
    if (!node) return;
    if (node.expanded) {
      persistAndUpdate(prev => ({ ...prev, [uuid]: { ...prev[uuid], expanded: false } }));
      return;
    }
    persistAndUpdate(prev => ({ ...prev, [uuid]: { ...prev[uuid], expanded: true } }));
    if (!node.data && node.loctype !== 'COUNTRY') {
      try {
        const arr = await fetchNode(uuid, node.name, node.loctype, node.parentUuid, node.parentName, selectedYear);
        const summary = getSummaryRecord(arr);
        const children = getChildRecords(arr);
        const childLoctype = CHILD_LOCTYPE[node.loctype] || 'BLOCK';
        persistAndUpdate(prev => {
          const next = { ...prev };
          next[uuid] = {
            ...next[uuid], data: summary, _responseArr: arr, childLoctype,
            childUuids: children.length > 0
              ? children.map(d => d.locationUUID).filter(Boolean)
              : extractChildUuids(summary),
          };
          children.forEach(d => {
            if (d.locationUUID && !next[d.locationUUID]) {
              const gcUuids = extractChildUuids(d);
              next[d.locationUUID] = {
                name: d.locationName, loctype: childLoctype, parentUuid: uuid, parentName: node.name,
                childUuids: gcUuids.length ? gcUuids : [], expanded: false, data: d,
                childLoctype: inferChildLoctype(d),
              };
            }
          });
          return next;
        });
      } catch (e) {
        persistAndUpdate(prev => ({ ...prev, [uuid]: { ...prev[uuid], childUuids: [] } }));
      }
    }
  }, [selectedYear, persistAndUpdate]);

  const loadNode = useCallback(async (uuid, name, loctype) => {
    const node = cacheRef.current[uuid];
    if (!node) return null;
    if (node.data) return node.data;
    const pUuid = node.parentUuid || INDIA_UUID;
    const pName = node.parentName || 'INDIA';
    const arr = await fetchNode(uuid, name, loctype, pUuid, pName, selectedYear);
    const matchedRecord = arr.find(d => d.locationUUID === uuid);
    const data = matchedRecord || getSummaryRecord(arr) || arr[0];
    const children = getChildRecords(arr).filter(d => d.locationUUID !== uuid);
    const childLoctype = CHILD_LOCTYPE[loctype] || 'BLOCK';
    persistAndUpdate(prev => {
      const next = { ...prev };
      next[uuid] = {
        ...next[uuid], data, _responseArr: arr, childLoctype,
        childUuids: (next[uuid].childUuids?.length > 0)
          ? next[uuid].childUuids
          : children.length > 0
            ? children.map(d => d.locationUUID).filter(Boolean)
            : extractChildUuids(data),
      };
      children.forEach(d => {
        if (d.locationUUID && !next[d.locationUUID]) {
          const gcUuids = extractChildUuids(d);
          next[d.locationUUID] = {
            name: d.locationName, loctype: childLoctype, parentUuid: uuid, parentName: name,
            childUuids: gcUuids.length ? gcUuids : [], expanded: false, data: d,
            childLoctype: inferChildLoctype(d),
          };
        }
      });
      return next;
    });
    return data;
  }, [selectedYear, persistAndUpdate]);

  const clearDataCache = useCallback(() => {
    persistAndUpdate(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[k] = { ...next[k], data: null }; });
      return next;
    });
  }, [persistAndUpdate]);

  return { cache, getNode, toggleExpand, loadNode, clearDataCache, persistAndUpdate };
}
