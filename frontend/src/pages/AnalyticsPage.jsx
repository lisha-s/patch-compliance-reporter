/* eslint-disable */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWindowSize } from '../hooks/useWindowSize'
import Navbar from '../components/Navbar'
import patchService from '../services/patchService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
  AreaChart, Area, Legend
} from 'recharts'

const SEVERITY_COLORS = {
  CRITICAL: '#dc2626', HIGH: '#ea580c',
  MEDIUM: '#ca8a04', LOW: '#2563eb', INFO: '#6b7280'
}
const STATUS_COLORS = {
  COMPLIANT: '#16a34a', NON_COMPLIANT: '#dc2626',
  PENDING: '#ca8a04', EXEMPT: '#6b7280'
}

const DEMO_STATS = {
  total: 15, compliant: 7, nonCompliant: 4, pending: 3, avgScore: 64,
  bySeverity: [
    { severity: 'CRITICAL', count: 5 },
    { severity: 'HIGH',     count: 4 },
    { severity: 'MEDIUM',   count: 4 },
    { severity: 'LOW',      count: 1 },
    { severity: 'INFO',     count: 1 },
  ],
  byStatus: [
    { status: 'COMPLIANT',     count: 7 },
    { status: 'NON_COMPLIANT', count: 4 },
    { status: 'PENDING',       count: 3 },
    { status: 'EXEMPT',        count: 1 },
  ],
  trend: [
    { month: 'Nov', compliant: 3, nonCompliant: 8 },
    { month: 'Dec', compliant: 5, nonCompliant: 7 },
    { month: 'Jan', compliant: 7, nonCompliant: 6 },
    { month: 'Feb', compliant: 9, nonCompliant: 4 },
    { month: 'Mar', compliant: 11, nonCompliant: 3 },
    { month: 'Apr', compliant: 7,  nonCompliant: 4 },
  ],
  scoreDistribution: [
    { range: '0-20',   count: 2 },
    { range: '21-40',  count: 1 },
    { range: '41-60',  count: 3 },
    { range: '61-80',  count: 4 },
    { range: '81-100', count: 5 },
  ]
}

export default function AnalyticsPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod]   = useState('6m')
  const [isDemo, setIsDemo]   = useState(false)
  const navigate = useNavigate()
  const { isMobile } = useWindowSize()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await patchService.getStats()
        const data = res.data
        setStats({
          ...data,
          byStatus: [
            { status: 'COMPLIANT',     count: data.compliant    ?? 0 },
            { status: 'NON_COMPLIANT', count: data.nonCompliant ?? 0 },
            { status: 'PENDING',       count: data.pending      ?? 0 },
            { status: 'EXEMPT',        count: 0 },
          ],
          trend:             DEMO_STATS.trend,
          scoreDistribution: DEMO_STATS.scoreDistribution,
        })
        setIsDemo(false)
      } catch {
        setStats(DEMO_STATS)
        setIsDemo(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  if (loading) {
    return (
      <>
        <Navbar activePage="analytics" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ width: '36px', height: '36px', border: '4px solid #e5e7eb', borderTopColor: '#1B4F8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </>
    )
  }

  const complianceRate = stats?.total ? Math.round((stats.compliant / stats.total) * 100) : 0

  return (
    <>
      <Navbar activePage="analytics" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px' : '32px 16px' }}>

        {/* Header + period selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px' }}>Analytics</h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Compliance trends and insights</p>
            {isDemo && (
              <span style={{ fontSize: '12px', background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: '10px', marginTop: '6px', display: 'inline-block' }}>
                ⚠️ Demo data — connect backend to see real analytics
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
            {[{ label: '1M', value: '1m' }, { label: '3M', value: '3m' }, { label: '6M', value: '6m' }, { label: '1Y', value: '1y' }].map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: period === p.value ? '#1B4F8A' : 'transparent', color: period === p.value ? 'white' : '#6b7280' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total Records',    value: stats?.total,        color: '#1B4F8A', icon: '📋' },
            { label: 'Compliance Rate',  value: complianceRate + '%', color: '#16a34a', icon: '✅' },
            { label: 'Avg Score',        value: stats?.avgScore ? Math.round(stats.avgScore) + '%' : '—', color: '#ca8a04', icon: '📊' },
            { label: 'Critical',         value: stats?.bySeverity?.find(s => s.severity === 'CRITICAL')?.count ?? 0, color: '#dc2626', icon: '🚨' },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: 'white', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderTop: `3px solid ${kpi.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{kpi.label}</p>
                  <p style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#111827', margin: 0 }}>{kpi.value}</p>
                </div>
                <span style={{ fontSize: '20px' }}>{kpi.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Severity bar */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px' }}>Records by Severity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.bySeverity ?? []} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="severity" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(stats?.bySeverity ?? []).map(e => <Cell key={e.severity} fill={SEVERITY_COLORS[e.severity] ?? '#6b7280'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px' }}>Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats?.byStatus ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70}
                  label={({ status, percent }) => `${status?.replace('_',' ')} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  {(stats?.byStatus ?? []).map((e, i) => <Cell key={e.status} fill={STATUS_COLORS[e.status] ?? '#6b7280'} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>

          {/* Trend area */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px' }}>Compliance Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.trend ?? []} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gnc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="compliant" name="Compliant" stroke="#16a34a" strokeWidth={2} fill="url(#gc)" />
                <Area type="monotone" dataKey="nonCompliant" name="Non-Compliant" stroke="#dc2626" strokeWidth={2} fill="url(#gnc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Score dist */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px' }}>Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.scoreDistribution ?? []} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} width={40} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#1B4F8A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  )
}