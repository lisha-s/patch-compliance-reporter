import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import patchService from '../services/patchService'

const STATUS_STYLE = {
  COMPLIANT:     { background: '#dcfce7', color: '#166534' },
  NON_COMPLIANT: { background: '#fee2e2', color: '#991b1b' },
  PENDING:       { background: '#fef9c3', color: '#854d0e' },
  EXEMPT:        { background: '#f3f4f6', color: '#6b7280' },
}

const SEVERITY_STYLE = {
  CRITICAL: { background: '#dc2626', color: 'white' },
  HIGH:     { background: '#ea580c', color: 'white' },
  MEDIUM:   { background: '#ca8a04', color: 'white' },
  LOW:      { background: '#2563eb', color: 'white' },
  INFO:     { background: '#6b7280', color: 'white' },
}

export default function PatchListPage() {
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await patchService.getAll(page, 10)
        if (!cancelled) {
          setRecords(res.data.content ?? res.data)
          setTotalPages(res.data.totalPages ?? 1)
        }
      } catch {
        if (!cancelled) setError('Failed to load patch records.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#1B4F8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading patch records…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <p style={{ color: '#dc2626', fontSize: '15px', marginBottom: '12px' }}>{error}</p>
        <button
          onClick={() => setPage(0)}
          style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <p style={{ fontSize: '22px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No patch records yet</p>
        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Create your first record to get started.</p>
        <button
          onClick={() => navigate('/patch/new')}
          style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '10px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          + New Record
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Patch Compliance Records</h1>
        <button
          onClick={() => navigate('/patch/new')}
          style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '9px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          + New Record
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Asset Name','Patch ID','Severity','Status','Score','Deadline',''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr
                key={r.id}
                style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff' }}
                onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa' }}
              >
                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>
                  {r.assetName}
                  {r.assetIp && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace', marginTop: '2px' }}>{r.assetIp}</div>
                  )}
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#4b5563' }}>{r.patchId}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ ...(SEVERITY_STYLE[r.severity] ?? {}), padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                    {r.severity}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ ...(STATUS_STYLE[r.status] ?? {}), padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {r.status?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {r.complianceScore != null
                    ? <span style={{ fontWeight: '700', color: r.complianceScore >= 70 ? '#16a34a' : r.complianceScore >= 40 ? '#ca8a04' : '#dc2626' }}>{r.complianceScore}%</span>
                    : <span style={{ color: '#9ca3af' }}>—</span>
                  }
                </td>
                <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '13px' }}>{r.patchDeadline ?? '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => navigate(`/patch/${r.id}`)}
                    style={{ color: '#1B4F8A', background: 'none', border: '1px solid #1B4F8A', padding: '4px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(p => Math.max(p - 1, 0))}
            disabled={page === 0}
            style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}