import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement, 
  ArcElement 
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import { AshokaLionCapital } from '../../components/Emblem';
import { 
  BarChart3, 
  TrendingUp, 
  Building2, 
  Users, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Languages, 
  Download,
  Filter,
  ShieldCheck
} from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

export default function StateNodalDashboard() {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [districtVolumes, setDistrictVolumes] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState(null);
  const [langDistribution, setLangDistribution] = useState([]);
  const [expiringList, setExpiringList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [sumRes, distRes, weekRes, langRes, expRes] = await Promise.all([
          fetch('/api/analytics/compliance-summary'),
          fetch('/api/analytics/district-volumes'),
          fetch('/api/analytics/weekly-trend'),
          fetch('/api/analytics/language-distribution'),
          fetch('/api/analytics/expiring-list')
        ]);

        if (sumRes.ok) setSummary(await sumRes.json());
        if (distRes.ok) setDistrictVolumes(await distRes.json());
        if (weekRes.ok) setWeeklyTrend(await weekRes.json());
        if (langRes.ok) setLangDistribution(await langRes.json());
        if (expRes.ok) setExpiringList(await expRes.json());
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();

    // Auto-refresh when training sessions or certificates are recorded
    const handleUpdate = () => {
      loadAnalytics();
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
  }, []);

  // Chart 1: Weekly Certification Volume by District (Government Palette)
  const weeklyChartData = {
    labels: weeklyTrend?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7 (Current)'],
    datasets: [
      {
        label: 'Dhanbad (Coal)',
        data: weeklyTrend?.datasets[0]?.data || [450, 620, 710, 890, 830, 950, 1020],
        backgroundColor: '#0c4e7e',
        borderRadius: 2
      },
      {
        label: 'Bokaro (Steel)',
        data: weeklyTrend?.datasets[1]?.data || [380, 420, 560, 680, 720, 810, 890],
        backgroundColor: '#1E7B34',
        borderRadius: 2
      },
      {
        label: 'Koderma (Mica)',
        data: weeklyTrend?.datasets[2]?.data || [190, 240, 310, 390, 420, 480, 520],
        backgroundColor: '#B8860B',
        borderRadius: 2
      },
      {
        label: 'Ramgarh (Coal)',
        data: weeklyTrend?.datasets[3]?.data || [220, 310, 390, 450, 510, 590, 640],
        backgroundColor: '#4682B4',
        borderRadius: 2
      }
    ]
  };

  // Chart 2: Language Distribution Doughnut Chart
  const languageChartData = {
    labels: langDistribution.map((l) => l.language),
    datasets: [
      {
        data: langDistribution.map((l) => l.percentage),
        backgroundColor: ['#0c4e7e', '#B8860B', '#1E7B34', '#64748B'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#4A5568', font: { family: "'Noto Sans', sans-serif", size: 12 } }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0c4e7e',
        bodyColor: '#1A202C',
        borderColor: '#CBD5E1',
        borderWidth: 1,
        boxPadding: 4
      }
    },
    scales: {
      x: {
        grid: { color: '#EDF2F7' },
        ticks: { color: '#64748B', font: { family: "'Noto Sans', sans-serif" } }
      },
      y: {
        grid: { color: '#EDF2F7' },
        ticks: { color: '#64748B', font: { family: "'Noto Sans', sans-serif" } }
      }
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* State Nodal Header Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AshokaLionCapital size={38} color="#0c4e7e" showMotto={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span className="gov-badge-navy">
                State Nodal Analytics
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                Academic Simulation Console • Modeled on Dept. of Mines & Geology (Govt. of Jharkhand)
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Jharkhand Industrial Mine Safety — State Analytics & Compliance Simulation
            </h2>

            <p style={{ fontSize: '0.86rem', color: '#4A5568', marginTop: '0.25rem' }}>
              Simulated State Nodal Officer: <strong>{currentUser.name}</strong> • Technical Evaluation Sandbox • Real-Time Regulatory Metrics
            </p>
          </div>
        </div>

        <div style={{
          background: '#F8FAFC',
          border: '1px solid #CBD5E1',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          fontSize: '0.78rem',
          color: '#4A5568'
        }}>
          Statutory Framework: <strong>Mines Act 1952 (DGMS Circulars)</strong>
        </div>
      </div>

      {/* Primary KPI Metrics Summary Bar (Formal e-Gov Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        {/* Metric 1: Total Workers Trained */}
        <div className="gov-card" style={{ padding: '1.25rem', borderTop: '3px solid #0c4e7e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                Total Workers Certified
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0c4e7e', margin: '0.2rem 0' }}>
                {summary?.workersTrained ? summary.workersTrained.toLocaleString() : '12,492'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#1E7B34', fontWeight: '600' }}>
                ↑ 18.4% month-over-month
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: '#EBF3FC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0c4e7e'
            }}>
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Metric 2: Module 1 PASS Rate */}
        <div className="gov-card" style={{ padding: '1.25rem', borderTop: '3px solid #1E7B34' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                Overall Pass Rate
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E7B34', margin: '0.2rem 0' }}>
                86%
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                DGMS Benchmark: 75%
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: '#EAF5EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1E7B34'
            }}>
              <Award size={20} />
            </div>
          </div>
        </div>

        {/* Metric 3: Sites Onboarded */}
        <div className="gov-card" style={{ padding: '1.25rem', borderTop: '3px solid #B8860B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                Active Mining Sites
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#B8860B', margin: '0.2rem 0' }}>
                348
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Coal, Steel & Mica units
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: '#FEF9E7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8B6508'
            }}>
              <Building2 size={20} />
            </div>
          </div>
        </div>

        {/* Metric 4: Expiring Soon Alert */}
        <div className="gov-card" style={{ padding: '1.25rem', borderTop: '3px solid #9B1C1C' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                Refresher Due (&lt;30d)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#9B1C1C', margin: '0.2rem 0' }}>
                {summary?.certsExpiringWarning || 15}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#9B1C1C', fontWeight: '600' }}>
                Notice issued to site officers
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: '#FDF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9B1C1C'
            }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.75rem'
      }}>
        {/* Chart 1: Weekly Certification Trajectory */}
        <div className="gov-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)' }}>
                Weekly Certification Volume by District
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Training progression across Dhanbad, Bokaro, Ramgarh & Koderma
              </p>
            </div>
            <span className="gov-badge-navy">Q3 2026</span>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={weeklyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Language Adoption Distribution */}
        <div className="gov-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)' }}>
                Tribal Language Distribution in AR Training
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Breakdown of voiceover & script usage among frontline workers
              </p>
            </div>
            <span className="gov-badge-amber">55% Santali</span>
          </div>
          <div style={{ height: '280px' }}>
            <Doughnut
              data={languageChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#4A5568', font: { family: "'Noto Sans', sans-serif", size: 12 } }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Early Warning Radar: Expiring Certifications */}
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)' }}>
              Statutory 30-Day Certificate Expiry Early Warning Radar
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
              Mines Act 1952 mandates annual refresher training. Workers expiring within 30 days are flagged below.
            </p>
          </div>
          <span className="gov-badge-amber">
            Action Required by Site Supervisors
          </span>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Worker Code</th>
                <th>Worker Name</th>
                <th>Contact Phone</th>
                <th>Mine Site</th>
                <th>Issue Date</th>
                <th>Statutory Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expiringList.length > 0 ? (
                expiringList.map((c) => (
                  <tr key={c.certificate_id}>
                    <td className="font-mono" style={{ fontWeight: '700', color: '#0c4e7e' }}>
                      {c.certificate_id}
                    </td>
                    <td className="font-mono" style={{ color: '#4A5568' }}>
                      {c.worker_code}
                    </td>
                    <td style={{ fontWeight: '700', color: '#1A202C' }}>
                      {c.worker_name}
                    </td>
                    <td style={{ color: '#4A5568' }}>
                      {c.phone || '+91 94311 20400'}
                    </td>
                    <td style={{ color: '#4A5568' }}>
                      {c.site_name}
                    </td>
                    <td style={{ color: '#64748B' }}>
                      {c.issue_date}
                    </td>
                    <td style={{ fontWeight: '700', color: '#9B1C1C' }}>
                      {c.expiry_date}
                    </td>
                    <td>
                      <span className="gov-badge-amber">
                        ⚠ Refresher Due
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#64748B', padding: '1.5rem' }}>
                    All statutory certifications are currently within their compliant validity window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
