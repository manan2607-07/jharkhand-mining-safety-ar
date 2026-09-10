import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const OfflineSyncContext = createContext();

const DB_NAME = 'JharkhandSafetyOfflineDB';
const DB_VERSION = 1;

// Open IndexedDB safely
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('certificates')) {
        db.createObjectStore('certificates', { keyPath: 'certificate_id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const OfflineSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Opportunistic sync on reconnect!
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of local queue count
    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPendingCount = async () => {
    try {
      const db = await openIndexedDB();
      const tx = db.transaction(['sessions', 'certificates'], 'readonly');
      const sessionsStore = tx.objectStore('sessions');
      const certsStore = tx.objectStore('certificates');

      const sessReq = sessionsStore.getAll();
      const certReq = certsStore.getAll();

      tx.oncomplete = () => {
        const total = (sessReq.result?.length || 0) + (certReq.result?.length || 0);
        setPendingSyncCount(total);
      };
    } catch (err) {
      console.warn('IndexedDB read error:', err);
    }
  };

  const saveOfflineSession = async (sessionData) => {
    try {
      const db = await openIndexedDB();
      const tx = db.transaction(['sessions'], 'readwrite');
      tx.objectStore('sessions').put({
        ...sessionData,
        id: sessionData.id || `LOCAL-SESS-${Date.now()}`,
        saved_at: new Date().toISOString()
      });
      await new Promise((res) => (tx.oncomplete = res));
      await refreshPendingCount();
      
      // If currently online, opportunistically sync immediately!
      if (navigator.onLine) {
        triggerSync();
      }
    } catch (err) {
      console.error('Error saving session locally:', err);
    }
  };

  const saveOfflineCertificate = async (certData) => {
    try {
      const db = await openIndexedDB();
      const tx = db.transaction(['certificates'], 'readwrite');
      tx.objectStore('certificates').put({
        ...certData,
        saved_at: new Date().toISOString()
      });
      await new Promise((res) => (tx.oncomplete = res));
      await refreshPendingCount();

      if (navigator.onLine) {
        triggerSync();
      }
    } catch (err) {
      console.error('Error saving certificate locally:', err);
    }
  };

  const triggerSync = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      const db = await openIndexedDB();
      const tx = db.transaction(['sessions', 'certificates'], 'readonly');
      const sessions = await new Promise((res) => {
        const req = tx.objectStore('sessions').getAll();
        req.onsuccess = () => res(req.result);
      });
      const certificates = await new Promise((res) => {
        const req = tx.objectStore('certificates').getAll();
        req.onsuccess = () => res(req.result);
      });

      if (!sessions.length && !certificates.length) {
        setIsSyncing(false);
        return;
      }

      const res = await apiFetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_device_id: 'FIELD-MOBILE-TAB-01',
          sessions,
          certificates
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Clear synced items
        const clearTx = db.transaction(['sessions', 'certificates'], 'readwrite');
        clearTx.objectStore('sessions').clear();
        clearTx.objectStore('certificates').clear();
        await new Promise((r) => (clearTx.oncomplete = r));

        setLastSyncResult({
          timestamp: new Date().toLocaleTimeString(),
          syncedSessions: data.syncedSessions,
          syncedCertificates: data.syncedCertificates
        });
        await refreshPendingCount();

        // Broadcast to admin portal so dashboards update immediately
        try {
          window.dispatchEvent(new CustomEvent('jh-safety-drill-completed', { detail: { synced: true, ...data } }));
          localStorage.setItem('jh_last_activity_ts', Date.now().toString());
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Sync failed (will retry when connectivity improves):', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <OfflineSyncContext.Provider value={{
      isOnline,
      pendingSyncCount,
      isSyncing,
      lastSyncResult,
      saveOfflineSession,
      saveOfflineCertificate,
      triggerSync
    }}>
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => useContext(OfflineSyncContext);
