
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import patchService from '../services/patchService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// ── Navbar ────────────────────────────────────────────
function Navbar({ user, logout, navigate }) {
  return (
    <div style={{ backgroundColor: '#1B4F8A', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
          🛡 Patch Compliance Reporter
        </span>
        <button onClick={() => navigate('/')}
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
          📋 Records
        </button>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          📊 Dashboard
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && <span style={{ color: '#bfdbfe', fontSize: '13px' }}>👤 {user.username}</span>}
        <button onClick={logout}
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
          Logout
        </button>
      </div>
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────
function KpiCard({ title, value, subtitle, color, icon }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}`, flex: 1, minWidth: '180px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
            {title}
          </p>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>
            {value ?? '—'}
          </p>
          {subtitle && (
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{subtitle}</p>
          )}
        </div>
        <span style={{ fontSize: '28px' }}>{icon}</span>
      </div>
    </div>
  )
}

// ── Chart colours per severity ────────────────────────
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
  const { user, logout } = useAuth()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await patchService.getStats()
        setStats(res.data)
      } catch {
        // Backend not running — use mock data so UI still works
        setStats({
          total:          0,
          compliant:      0,
          nonCompliant:   0,
          pending:        0,
          avgScore:       0,
          bySeverity: [
            { severity: 'CRITICAL', count: 0 },
            { severity: 'HIGH',     count: 0 },
            { severity: 'MEDIUM',   count: 0 },
            { severity: 'LOW',      count: 0 },
          ]
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
        <Navbar user={user} logout={logout} navigate={navigate} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <p style={{ color: '#6b7280' }}>Loading dashboard…</p>
        </div>
      </>
    )
  }

  // ── Chart data ──────────────────────────────────────
  const chartData = stats?.bySeverity ?? []

  return (
    <>
      <Navbar user={user} logout={logout} navigate={navigate} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Overview of patch compliance across all assets
          </p>
          {error && (
            <p style={{ color: '#ca8a04', fontSize: '12px', marginTop: '6px', background: '#fef9c3', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* ── 4 KPI Cards ── */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
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
            subtitle={stats?.total ? `${Math.round((stats.compliant / stats.total) * 100)}% of total` : '0% of total'}
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
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 20px' }}>
            Records by Severity
          </h2>
          {chartData.length === 0 || chartData.every(d => d.count === 0) ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#9ca3af' }}>No data yet — records will appear here once backend is connected</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="severity" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.severity}
                      fill={SEVERITY_COLORS[entry.severity] ?? '#6b7280'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Status breakdown ── */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }}>
            Status Breakdown
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Compliant',     value: stats?.compliant,    bg: '#dcfce7', color: '#166534' },
              { label: 'Non-Compliant', value: stats?.nonCompliant, bg: '#fee2e2', color: '#991b1b' },
              { label: 'Pending',       value: stats?.pending,      bg: '#fef9c3', color: '#854d0e' },
              { label: 'Total',         value: stats?.total,        bg: '#eff6ff', color: '#1e40af' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, borderRadius: '10px', padding: '16px 24px', minWidth: '140px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: '800', color: item.color, margin: '0 0 4px' }}>
                  {item.value ?? 0}
                </p>
                <p style={{ fontSize: '12px', fontWeight: '600', color: item.color, margin: 0 }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}