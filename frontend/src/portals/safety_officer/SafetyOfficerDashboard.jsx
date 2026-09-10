import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiFetch } from '../../services/api';
import { 
  Building2, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  Award,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  X
} from 'lucide-react';

export default function SafetyOfficerDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [workers, setWorkers] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // New Worker Form State
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerLang, setNewWorkerLang] = useState('SANTALI');
  const [newWorkerDesig, setNewWorkerDesig] = useState('Trainee Miner');
  const [newWorkerPhone, setNewWorkerPhone] = useState('+91 94311 ');
  const [newWorkerCohort, setNewWorkerCohort] = useState('COH-DHN-2026-A');

  useEffect(() => {
    fetchSiteData();

    // Auto-refresh when worker completes drills or sync occurs
    const handleUpdate = () => {
      fetchSiteData();
    };

    window.addEventListener('jh-safety-drill-completed', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);
    return () => {
      window.removeEventListener('jh-safety-drill-completed', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
    };
  }, [currentUser.siteId]);

  const fetchSiteData = async () => {
    try {
      setLoading(true);
      const [workersRes, cohortsRes] = await Promise.all([
        apiFetch('/api/workers'),
        apiFetch('/api/workers/cohorts/list')
      ]);

      if (workersRes.ok) {
        const wData = await workersRes.json();
        setWorkers(wData);
      }
      if (cohortsRes.ok) {
        const cData = await cohortsRes.json();
        setCohorts(cData);
        if (cData.length > 0 && !newWorkerCohort) {
          setNewWorkerCohort(cData[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading site data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollWorker = async (e) => {
    e.preventDefault();
    if (!newWorkerName) return;

    try {
      const res = await apiFetch('/api/workers/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newWorkerName,
          tribal_language: newWorkerLang,
          designation: newWorkerDesig,
          phone: newWorkerPhone,
          site_id: currentUser.siteId || 'SITE-DHN-01',
          cohort_id: newWorkerCohort || cohorts[0]?.id || 'COH-DHN-2026-A'
        })
      });

      if (res.ok) {
        setShowEnrollModal(false);
        setNewWorkerName('');
        fetchSiteData();
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch = w.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.worker_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCohort = selectedCohort === 'ALL' || w.cohort_id === selectedCohort;
    return matchesSearch && matchesCohort;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Site Header Banner (Government e-Gov Station Banner) */}
      <div className="gov-card" style={{
        padding: '1.5rem',
        marginBottom: '1.75rem',
        borderLeft: '5px solid #0c4e7e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="gov-badge-navy">
              Statutory Supervisory Station
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              District: <strong>{currentUser.district}</strong> • Sector: <strong>{currentUser.sector}</strong>
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', margin: 0 }}>
            {currentUser.siteName}
          </h2>

          <p style={{ fontSize: '0.86rem', color: '#4A5568', marginTop: '0.25rem' }}>
            Supervisory Officer: <strong>{currentUser.name}</strong> • DGMS Statutory Training Station #4
          </p>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="gov-btn-primary"
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
        >
          <UserPlus size={16} />
          <span>Onboard New Recruit</span>
        </button>
      </div>

      {/* Cohort Progress Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        {cohorts.map((coh) => (
          <div key={coh.id} className="gov-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                  Training Cohort Batch
                </span>
                <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#0c4e7e' }}>{coh.name}</div>
              </div>
              <span className={coh.status === 'COMPLETED' ? 'gov-badge-green' : 'gov-badge-amber'}>
                {coh.status}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#4A5568', marginBottom: '0.5rem' }}>
              <span>Enrolled: <strong>{coh.total_enrolled || 12}</strong> miners</span>
              <span>Certified: <strong style={{ color: '#1E7B34' }}>{coh.certified_count || 6}</strong></span>
            </div>

            {/* Official Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: '#EDF2F7',
              borderRadius: '2px',
              overflow: 'hidden',
              border: '1px solid #CBD5E1'
            }}>
              <div style={{
                width: `${Math.round(((coh.certified_count || 6) / (coh.total_enrolled || 12)) * 100)}%`,
                height: '100%',
                background: '#1E7B34'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Workforce Roster Table */}
      <div className="gov-card" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid #E2E8F0'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)' }}>
              Frontline Workforce Roster & DGMS Certification Status
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
              Monitoring tribal language preferences, literacy indicators, and active statutory safety certifications
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              padding: '0.4rem 0.75rem',
              gap: '0.5rem'
            }}>
              <Search size={15} color="#64748B" />
              <input
                type="text"
                placeholder="Search by worker name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1A202C',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '210px'
                }}
              />
            </div>

            {/* Cohort Filter */}
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="gov-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.84rem' }}
            >
              <option value="ALL">All Training Cohorts</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Worker Code</th>
                <th>Full Name</th>
                <th>Tribal Language</th>
                <th>Literacy</th>
                <th>Designation</th>
                <th>Active Certs</th>
                <th>Statutory Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((w) => (
                <tr key={w.id}>
                  <td className="font-mono" style={{ fontWeight: '700', color: '#0c4e7e' }}>
                    {w.worker_code}
                  </td>
                  <td style={{ fontWeight: '700', color: '#1A202C' }}>
                    {w.full_name}
                  </td>
                  <td>
                    <span className={w.tribal_language === 'SANTALI' ? 'gov-badge-amber' : 'gov-badge-grey'}>
                      {w.tribal_language} {w.tribal_language === 'SANTALI' ? '(Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)' : ''}
                    </span>
                  </td>
                  <td style={{ color: '#4A5568' }}>
                    {w.literacy_level}
                  </td>
                  <td style={{ color: '#4A5568' }}>
                    {w.designation}
                  </td>
                  <td style={{ fontWeight: '700', color: w.active_certs_count > 0 ? '#1E7B34' : '#B8860B' }}>
                    <div>{w.active_certs_count} / 2 Modules</div>
                    {w.training_sessions_count > 0 && (
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>
                        {w.training_sessions_count} drill(s) • Best: {w.latest_score}%
                      </div>
                    )}
                  </td>
                  <td>
                    {w.active_certs_count > 0 ? (
                      <span className="gov-badge-green">
                        <CheckCircle2 size={13} /> DGMS Compliant
                      </span>
                    ) : (
                      <span className="gov-badge-amber">
                        <Clock size={13} /> Training Due
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard New Recruits Modal (Official Govt Modal Dialog) */}
      {showEnrollModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 53, 86, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="gov-card" style={{ maxWidth: '540px', width: '100%', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '2px solid #0c4e7e', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  Onboard Frontline Tribal Recruit
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Register recruit into {currentUser.siteName} for camera-based AR training.
                </p>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
                aria-label="Close Dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEnrollWorker}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#2D3748', marginBottom: '0.35rem' }}>
                  Full Name (with Tribal Surname):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanatan Murmu"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="gov-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#2D3748', marginBottom: '0.35rem' }}>
                    Primary Language:
                  </label>
                  <select
                    value={newWorkerLang}
                    onChange={(e) => setNewWorkerLang(e.target.value)}
                    className="gov-select"
                  >
                    <option value="SANTALI">Santali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)</option>
                    <option value="HINDI">Hindi (हिन्दी)</option>
                    <option value="MUNDARI">Mundari</option>
                    <option value="HO">Ho</option>
                    <option value="ENGLISH">English</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#2D3748', marginBottom: '0.35rem' }}>
                    Designation:
                  </label>
                  <input
                    type="text"
                    value={newWorkerDesig}
                    onChange={(e) => setNewWorkerDesig(e.target.value)}
                    className="gov-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#2D3748', marginBottom: '0.35rem' }}>
                  Contact Phone Number:
                </label>
                <input
                  type="text"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  className="gov-input"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#2D3748', marginBottom: '0.35rem' }}>
                  Assign to Training Cohort:
                </label>
                <select
                  value={newWorkerCohort}
                  onChange={(e) => setNewWorkerCohort(e.target.value)}
                  className="gov-select"
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.site_name || c.district})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="gov-btn-secondary"
                  style={{ padding: '0.55rem 1.15rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gov-btn-primary"
                  style={{ padding: '0.55rem 1.25rem' }}
                >
                  Enroll Worker & Assign AR Modules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
