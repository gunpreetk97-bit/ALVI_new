// ============================================================================
// ALVI Local Storage & IndexedDB Module — js/storage.js
// NEW FRONTEND-ONLY IMPLEMENTATION
//
// Provides persistent client-side storage for:
// 1. Audio recordings (IndexedDB: stores raw audio Blobs for playback & feature extraction)
// 2. Evaluated sessions & Judge assessment data
// 3. JSON Import / Export for local data preservation and evaluation
// ============================================================================

window.ALVI = window.ALVI || {};

(function () {
  const DB_NAME = 'ALVI_Prototype_DB';
  const DB_VERSION = 1;
  const STORE_RECORDINGS = 'recordings';
  const STORE_SESSIONS = 'sessions';

  let dbPromise = null;

  function getDB() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
          console.warn('IndexedDB is not supported in this browser environment.');
          resolve(null);
          return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_RECORDINGS)) {
            db.createObjectStore(STORE_RECORDINGS, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
            db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = (err) => {
          console.error('IndexedDB open error:', err);
          resolve(null);
        };
      });
    }
    return dbPromise;
  }

  // ── Audio Storage in IndexedDB ─────────────────────────────────────────────
  async function saveAudio(key, blob, metadata = {}) {
    try {
      const db = await getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_RECORDINGS], 'readwrite');
        const store = tx.objectStore(STORE_RECORDINGS);
        const record = {
          key,
          blob,
          mimeType: blob.type || 'audio/webm',
          size: blob.size,
          updatedAt: new Date().toISOString(),
          metadata
        };
        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn('Failed to save audio in IndexedDB:', e);
      return false;
    }
  }

  async function getAudio(key) {
    try {
      const db = await getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_RECORDINGS], 'readonly');
        const store = tx.objectStore(STORE_RECORDINGS);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.blob : null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn('Failed to get audio from IndexedDB:', e);
      return null;
    }
  }

  async function deleteAudio(key) {
    try {
      const db = await getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_RECORDINGS], 'readwrite');
        const store = tx.objectStore(STORE_RECORDINGS);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  // ── JSON Export / Import Utilities ─────────────────────────────────────────
  function exportDataAsJSON(data, filename = 'alvi_export.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function readJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          resolve(parsed);
        } catch (err) {
          reject(new Error('Invalid JSON file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  window.ALVI.storage = {
    saveAudio,
    getAudio,
    deleteAudio,
    exportDataAsJSON,
    readJSONFile
  };
})();

