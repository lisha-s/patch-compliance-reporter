/* eslint-disable */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWindowSize } from '../hooks/useWindowSize'
import Navbar from '../components/Navbar'
import patchService from '../services/patchService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// ── KPI Card ───────────────────────────────────────────
function KpiCard({ title, value, subtitle, color, icon }) {
  return (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '20px',
      boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`, flex: 1, minWidth: '140px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
            {title}
          </p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>
            {value ?? '—'}
          </p>
          {subtitle && (
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{subtitle}</p>
          )}
        </div>
        <span style={{ fontSize: '24px' }}>{icon}</span>
      </div>
    </div>
  )
}

const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH:     '#ea580c',
  MEDIUM:   '#ca8a04',
  LOW:      '#2563eb',
  INFO:     '#6b7280',
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const navigate = useNavigate()
  const { isMobile } = useWindowSize()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await patchService.getStats()
        setStats(res.data)
        setError(null)
      } catch {
        setStats({
          total: 0, compliant: 0, nonCompliant: 0,
          pending: 0, avgScore: 0, bySeverity: []
        })
        setError('Backend not connected — showing empty dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <>
        <Navbar activePage="dashboard" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ width: '36px', height: '36px', border: '4px solid #e5e7eb', borderTopColor: '#1B4F8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </>
    )
  }

  const chartData      = stats?.bySeverity ?? []
  const complianceRate = stats?.total
    ? Math.round((stats.compliant / stats.total) * 100) : 0

  return (
    <>
      <Navbar activePage="dashboard" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px' : '32px 16px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px' }}>
              Dashboard
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Overview of patch compliance across all assets
            </p>
            {error && (
              <p style={{ color: '#ca8a04', fontSize: '12px', marginTop: '8px', background: '#fef9c3', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', margin: '8px 0 0' }}>
                ⚠️ {error}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/analytics')}
            style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '9px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }}
          >
            📈 View Full Analytics →
          </button>
        </div>

        {/* ── 4 KPI Cards ── */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <KpiCard
            title="Total Records"
            value={stats?.total}
            subtitle="All patch records"
            color="#1B4F8A"
            icon="📋"
          />
          <KpiCard
            title="Compliant"
            value={stats?.compliant}
            subtitle={`${complianceRate}% of total`}
            color="#16a34a"
            icon="✅"
          />
          <KpiCard
            title="Non-Compliant"
            value={stats?.nonCompliant}
            subtitle="Needs attention"
            color="#dc2626"
            icon="🚨"
          />
          <KpiCard
            title="Avg Score"
            value={stats?.avgScore ? `${Math.round(stats.avgScore)}%` : '—'}
            subtitle="Compliance score"
            color={stats?.avgScore >= 70 ? '#16a34a' : stats?.avgScore >= 40 ? '#ca8a04' : '#dc2626'}
            icon="📊"
          />
        </div>

        {/* ── Bar Chart ── */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }}>
            Records by Severity
          </h2>
          {chartData.length === 0 || chartData.every(d => d.count === 0) ? (
            <div style={{ height: isMobile ? '150px' : '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '14px' }}>
                No data yet — records will appear here once backend is connected
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="severity" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map(entry => (
                    <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Status Breakdown ── */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }}>
            Status Breakdown
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Compliant',     value: stats?.compliant,    bg: '#dcfce7', color: '#166534' },
              { label: 'Non-Compliant', value: stats?.nonCompliant, bg: '#fee2e2', color: '#991b1b' },
              { label: 'Pending',       value: stats?.pending,      bg: '#fef9c3', color: '#854d0e' },
              { label: 'Total',         value: stats?.total,        bg: '#eff6ff', color: '#1e40af' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, borderRadius: '10px', padding: '16px 20px', minWidth: '120px', textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: '26px', fontWeight: '800', color: item.color, margin: '0 0 4px' }}>
                  {item.value ?? 0}
                </p>
                <p style={{ fontSize: '12px', fontWeight: '600', color: item.color, margin: 0 }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '20px' }}>

          {/* Go to Records */}
          <div
            onClick={() => navigate('/')}
            style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.08)'}
          >
            <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              📋
            </div>
            <div>
              <p style={{ fontWeight: '700', color: '#111827', fontSize: '15px', margin: '0 0 3px' }}>View All Records</p>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Browse, search and filter patch records</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#1B4F8A', fontSize: '18px' }}>→</span>
          </div>

          {/* Add New Record */}
          <div
            onClick={() => navigate('/patch/new')}
            style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.08)'}
          >
            <div style={{ width: '44px', height: '44px', background: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              ➕
            </div>
            <div>
              <p style={{ fontWeight: '700', color: '#111827', fontSize: '15px', margin: '0 0 3px' }}>Add New Record</p>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Create a new patch compliance record</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#16a34a', fontSize: '18px' }}>→</span>
          </div>
        </div>

        {/* ── Analytics Banner ── */}
        <div style={{ background: 'linear-gradient(135deg, #1B4F8A 0%, #2563eb 100%)', borderRadius: '12px', padding: isMobile ? '20px' : '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: 'white', fontWeight: '700', fontSize: isMobile ? '16px' : '18px', margin: '0 0 6px' }}>
              📈 Want deeper insights?
            </p>
            <p style={{ color: '#bfdbfe', fontSize: '13px', margin: 0 }}>
              View compliance trends, score distribution, severity breakdown and more in the Analytics page
            </p>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            style={{ backgroundColor: 'white', color: '#1B4F8A', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Open Analytics →
          </button>
        </div>

      </div>
    </>
  )
}