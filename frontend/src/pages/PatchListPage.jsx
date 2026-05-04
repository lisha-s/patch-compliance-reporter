/* eslint-disable */
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWindowSize } from '../hooks/useWindowSize'
import Navbar from '../components/Navbar'
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
  const [records, setRecords]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [page, setPage]                 = useState(0)
  const [totalPages, setTotalPages]     = useState(1)
  const [searchInput, setSearchInput]   = useState('')
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [exporting, setExporting]       = useState(false)

  const navigate         = useNavigate()
  const { user, logout } = useAuth()
  const { isMobile, isTablet } = useWindowSize()
  const debounceTimer    = useRef(null)

  const handleSearchInput = (e) => {
    const val = e.target.value
    setSearchInput(val)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setSearch(val)
      setPage(0)
    }, 400)
  }

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

  const filtered = records.filter(r => {
    const matchSearch = !search ||
      r.assetName?.toLowerCase().includes(search.toLowerCase()) ||
      r.patchId?.toLowerCase().includes(search.toLowerCase()) ||
      r.patchTitle?.toLowerCase().includes(search.toLowerCase())
    const matchStatus   = !statusFilter || r.status === statusFilter
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

  const handleExport = async () => {
    setExporting(true)
    try {
      const res  = await patchService.exportCsv()
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', 'patch-records.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Export failed. Make sure the backend is running.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
  return (
    <>
      <Navbar activePage="records" />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px' : '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ height: '28px', width: '260px', background: '#e5e7eb', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '36px', width: '120px', background: '#e5e7eb', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ height: '16px', flex: 2, background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '16px', flex: 1, background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '16px', flex: 1, background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '16px', flex: 1, background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    </>
  )
}

  if (error) {
    return (
      <>
        <Navbar activePage="records" />
        <div style={{ textAlign: 'center', marginTop: '80px', padding: '0 16px' }}>
          <p style={{ color: '#dc2626', fontSize: '15px', marginBottom: '12px' }}>{error}</p>
          <button onClick={() => setPage(0)}
            style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </>
    )
  }

  if (records.length === 0) {
    return (
      <>
        <Navbar activePage="records" />
        <div style={{ textAlign: 'center', marginTop: '80px', padding: '0 16px' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            No patch records yet
          </p>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
            Create your first record to get started.
          </p>
          <button onClick={() => navigate('/patch/new')}
            style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '10px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            + New Record
          </button>
        </div>
      </>
    )
  }

  const pad = isMobile ? '16px' : '32px 16px'
  const maxW = '1200px'

  return (
    <>
      <Navbar activePage="records" />

      <div style={{ maxWidth: maxW, margin: '0 auto', padding: pad }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Patch Compliance Records
          </h1>
          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
            <button onClick={handleExport} disabled={exporting}
              style={{ flex: isMobile ? 1 : 'none', backgroundColor: '#16a34a', color: 'white', padding: '9px 14px', borderRadius: '6px', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', opacity: exporting ? 0.7 : 1 }}>
              {exporting ? 'Exporting…' : '⬇ CSV'}
            </button>
            <button onClick={() => navigate('/patch/new')}
              style={{ flex: isMobile ? 1 : 'none', backgroundColor: '#1B4F8A', color: 'white', padding: '9px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              + New Record
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

            <div style={{ flex: '2 1 180px', minWidth: '0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>Search</label>
              <input type="text" placeholder="Asset, patch ID..." value={searchInput}
                onChange={handleSearchInput}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <div style={{ flex: '1 1 130px', minWidth: '0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>Status</label>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', background: 'white' }}>
                <option value="">All</option>
                <option value="COMPLIANT">Compliant</option>
                <option value="NON_COMPLIANT">Non-Compliant</option>
                <option value="PENDING">Pending</option>
                <option value="EXEMPT">Exempt</option>
              </select>
            </div>

            {!isMobile && (
              <>
                <div style={{ flex: '1 1 130px', minWidth: '0' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>From</label>
                  <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: '1 1 130px', minWidth: '0' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' }}>To</label>
                  <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}

            {hasFilters && (
              <button onClick={clearFilters}
                style={{ padding: '8px 14px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', alignSelf: 'flex-end' }}>
                ✕ Clear
              </button>
            )}
          </div>

          {hasFilters && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
              <strong>{filtered.length}</strong> of <strong>{records.length}</strong> records
              {statusFilter && <span style={{ marginLeft: '6px', background: '#eff6ff', color: '#1e40af', padding: '1px 8px', borderRadius: '10px' }}>{statusFilter}</span>}
              {search && <span style={{ marginLeft: '6px', background: '#f3f4f6', color: '#374151', padding: '1px 8px', borderRadius: '10px' }}>"{search}"</span>}
            </div>
          )}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', background: 'white', borderRadius: '10px' }}>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '12px' }}>No records match your filters</p>
            <button onClick={clearFilters}
              style={{ background: 'none', border: '1px solid #d1d5db', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              Clear filters
            </button>
          </div>
        )}

        {/* Mobile card view */}
        {isMobile && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${SEVERITY_STYLE[r.severity]?.background ?? '#6b7280'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontWeight: '700', color: '#111827', fontSize: '14px', margin: '0 0 2px' }}>{r.assetName}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280', margin: 0 }}>{r.patchId}</p>
                  </div>
                  <span style={{ ...(STATUS_STYLE[r.status] ?? {}), padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {r.status?.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ ...(SEVERITY_STYLE[r.severity] ?? {}), padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>
                      {r.severity}
                    </span>
                    {r.complianceScore != null && (
                      <span style={{ fontWeight: '700', fontSize: '13px', color: r.complianceScore >= 70 ? '#16a34a' : r.complianceScore >= 40 ? '#ca8a04' : '#dc2626' }}>
                        {r.complianceScore}%
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => navigate(`/patch/${r.id}`)}
                      style={{ color: '#1B4F8A', background: 'none', border: '1px solid #1B4F8A', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                      View
                    </button>
                    <button onClick={() => navigate(`/patch/${r.id}/edit`)}
                      style={{ color: '#374151', background: 'none', border: '1px solid #d1d5db', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop/Tablet table view */}
        {!isMobile && filtered.length > 0 && (
          <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '640px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Asset Name', 'Patch ID', 'Severity', 'Status', 'Score', 'Deadline', ''].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                    <td style={{ padding: '13px 14px', fontWeight: '600', color: '#111827' }}>
                      {r.assetName}
                      {r.assetIp && <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace', marginTop: '2px' }}>{r.assetIp}</div>}
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#4b5563' }}>{r.patchId}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ ...(SEVERITY_STYLE[r.severity] ?? {}), padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                        {r.severity}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ ...(STATUS_STYLE[r.status] ?? {}), padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      {r.complianceScore != null
                        ? <span style={{ fontWeight: '700', color: r.complianceScore >= 70 ? '#16a34a' : r.complianceScore >= 40 ? '#ca8a04' : '#dc2626' }}>{r.complianceScore}%</span>
                        : <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 14px', color: '#6b7280', fontSize: '13px' }}>{r.patchDeadline ?? '—'}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => navigate(`/patch/${r.id}`)}
                          style={{ color: '#1B4F8A', background: 'none', border: '1px solid #1B4F8A', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                          View
                        </button>
                        <button onClick={() => navigate(`/patch/${r.id}/edit`)}
                          style={{ color: '#374151', background: 'none', border: '1px solid #d1d5db', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, fontSize: '13px' }}>
              ← Prev
            </button>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {page + 1} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page >= totalPages - 1}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1, fontSize: '13px' }}>
              Next →
            </button>
          </div>
        )}

      </div>
    </>
  )
}