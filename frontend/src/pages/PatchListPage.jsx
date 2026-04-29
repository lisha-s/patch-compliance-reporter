/* eslint-disable */
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

// ── Navbar defined OUTSIDE ────────────────────────────
function Navbar({ user, logout, navigate }) {
  return (
    <div style={{ backgroundColor: '#1B4F8A', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>🛡 Patch Compliance Reporter</span>
        <button onClick={() => navigate('/')}
          style={{ background: 'rgba(255,255,255,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          📋 Records
        </button>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
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

export default function PatchListPage() {
  const [records, setRecords]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [page, setPage]               = useState(0)
  const [totalPages, setTotalPages]   = useState(1)

  // ── Filter state ──────────────────────────────────
  const [searchInput, setSearchInput] = useState('')   // what user types
  const [search, setSearch]           = useState('')   // debounced value
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')

  const navigate         = useNavigate()
  const { user, logout } = useAuth()
  const debounceTimer    = useRef(null)

  // ── Debounce: wait 400ms after user stops typing ──
  const handleSearchInput = (e) => {
    const val = e.target.value
    setSearchInput(val)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setSearch(val)
      setPage(0)
    }, 400)
  }

  // ── Load records ──────────────────────────────────
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

  // ── Client-side filtering ─────────────────────────
  const filtered = records.filter(r => {
    const matchSearch = !search ||
      r.assetName?.toLowerCase().includes(search.toLowerCase()) ||
      r.patchId?.toLowerCase().includes(search.toLowerCase()) ||
      r.patchTitle?.toLowerCase().includes(search.toLowerCase())

    const matchStatus = !statusFilter || r.status === statusFilter

    const matchDateFrom = !dateFrom || (r.patchDeadline && r.patchDeadline >= dateFrom)
    const matchDateTo   = !dateTo   || (r.patchDeadline && r.patchDeadline <= dateTo)

    return matchSearch && matchStatus && matchDateFrom && matchDateTo
  })

  const hasFilters = search || statusFilter || dateFrom || dateTo

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(0)
  }

  // ── Filter bar component ──────────────────────────
  const FilterBar = () => (
    <div style={{ background: 'white', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

        {/* Search input */}
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase' }}>
            Search
          </label>
          <input
            type="text"
            placeholder="Asset name, patch ID, title..."
            value={searchInput}
            onChange={handleSearchInput}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        {/* Status dropdown */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase' }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', background: 'white' }}
          >
            <option value="">All Statuses</option>
            <option value="COMPLIANT">Compliant</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
            <option value="PENDING">Pending</option>
            <option value="EXEMPT">Exempt</option>
          </select>
        </div>

        {/* Date From */}
        <div style={{ flex: 1, minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase' }}>
            Deadline From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(0) }}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Date To */}
        <div style={{ flex: 1, minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase' }}>
            Deadline To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(0) }}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Clear filters button */}
        {hasFilters && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={clearFilters}
              style={{ padding: '8px 16px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}
            >
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      {/* Active filter summary */}
      {hasFilters && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{records.length}</strong> records
          {statusFilter && <span style={{ marginLeft: '8px', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '10px' }}>{statusFilter}</span>}
          {search && <span style={{ marginLeft: '8px', background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '10px' }}>"{search}"</span>}
          {dateFrom && <span style={{ marginLeft: '8px', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '10px' }}>From {dateFrom}</span>}
          {dateTo && <span style={{ marginLeft: '8px', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '10px' }}>To {dateTo}</span>}
        </div>
      )}
    </div>
  )

  // ── Loading ───────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar user={user} logout={logout} navigate={navigate} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#1B4F8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading patch records…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </>
    )
  }

  // ── Error ─────────────────────────────────────────
  if (error) {
    return (
      <>
        <Navbar user={user} logout={logout} navigate={navigate} />
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <p style={{ color: '#dc2626', fontSize: '15px', marginBottom: '12px' }}>{error}</p>
          <button onClick={() => setPage(0)}
            style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </>
    )
  }

  // ── Empty (no records at all) ─────────────────────
  if (records.length === 0) {
    return (
      <>
        <Navbar user={user} logout={logout} navigate={navigate} />
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <p style={{ fontSize: '22px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No patch records yet</p>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Create your first record to get started.</p>
          <button onClick={() => navigate('/patch/new')}
            style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '10px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            + New Record
          </button>
        </div>
      </>
    )
  }

  // ── Main table ────────────────────────────────────
  return (
    <>
      <Navbar user={user} logout={logout} navigate={navigate} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Patch Compliance Records
          </h1>
          <button onClick={() => navigate('/patch/new')}
            style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '9px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            + New Record
          </button>
        </div>

        {/* Filter bar */}
        <FilterBar />

        {/* No results after filtering */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '10px' }}>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '12px' }}>
              No records match your filters
            </p>
            <button onClick={clearFilters}
              style={{ background: 'none', border: '1px solid #d1d5db', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              Clear all filters
            </button>
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Asset Name', 'Patch ID', 'Severity', 'Status', 'Score', 'Deadline', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}
                    style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa' }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>
                      {r.assetName}
                      {r.assetIp && <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace', marginTop: '2px' }}>{r.assetIp}</div>}
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
                        : <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '13px' }}>{r.patchDeadline ?? '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => navigate(`/patch/${r.id}`)}
                          style={{ color: '#1B4F8A', background: 'none', border: '1px solid #1B4F8A', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                          View
                        </button>
                        <button onClick={() => navigate(`/patch/${r.id}/edit`)}
                          style={{ color: '#374151', background: 'none', border: '1px solid #d1d5db', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}
              style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}>
              ← Prev
            </button>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page >= totalPages - 1}
              style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        )}

      </div>
    </>
  )
}