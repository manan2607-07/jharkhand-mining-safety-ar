import React from 'react';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { WifiOff, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline, pendingSyncCount, isSyncing, triggerSync, lastSyncResult } = useOfflineSync();

  if (isOnline && pendingSyncCount === 0 && !lastSyncResult) {
    return null;
  }

  const isOffline = !isOnline;
  const hasPending = isOnline && pendingSyncCount > 0;

  const bannerBg = isOffline ? '#FEF9E7' : hasPending ? '#EBF3FC' : '#EAF5EC';
  const bannerBorder = isOffline ? '#F3DC9B' : hasPending ? '#B4D3F7' : '#B8E0C0';
  const bannerColor = isOffline ? '#8B6508' : hasPending ? '#0c4e7e' : '#1E7B34';

  return (
    <div
      role="alert"
      className="no-print"
      style={{
        background: bannerBg,
        borderBottom: `1px solid ${bannerBorder}`,
        color: bannerColor,
        padding: '0.5rem 1.25rem',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {isOffline ? (
          <>
            <WifiOff size={16} color="#8B6508" />
            <span>
              <strong>Statutory Field Notice:</strong> Portal operating in offline mode. Vocational training modules, adaptive evaluations, and issued certificates are cached in local IndexedDB storage.
            </span>
          </>
        ) : hasPending ? (
          <>
            <AlertCircle size={16} color="#0c4e7e" />
            <span>
              <strong>State Ledger Synchronization:</strong> {pendingSyncCount} cached training record(s) queued for transmission to the central simulation compliance ledger.
            </span>
          </>
        ) : (
          <>
            <ShieldCheck size={16} color="#1E7B34" />
            <span>
              <strong>Ledger Synchronized:</strong> Field training records successfully transmitted and recorded in the State Compliance Ledger ({lastSyncResult?.syncedSessions || 0} training session(s), {lastSyncResult?.syncedCertificates || 0} certificate(s)).
            </span>
          </>
        )}
      </div>

      {hasPending && (
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          className="gov-btn-primary"
          style={{
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            background: '#0c4e7e',
            borderRadius: '3px'
          }}
        >
          <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Transmitting...' : 'Transmit Records Now'}
        </button>
      )}
    </div>
  );
}
