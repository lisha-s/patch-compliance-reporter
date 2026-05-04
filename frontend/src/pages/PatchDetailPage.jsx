
import { useEffect, useState } from 'react'

import { useParams, useNavigate } from 'react-router-dom'
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

// ── Navbar ─────────────────────────────────────────────
function Navbar({ user, logout }) {
  return (
    <div style={{ backgroundColor: '#1B4F8A', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
        🛡 Patch Compliance Reporter
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <span style={{ color: '#bfdbfe', fontSize: '13px' }}>👤 {user.username}</span>
        )}
        <button
          onClick={logout}
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

// ── Field row ──────────────────────────────────────────
function Field({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ fontSize: '15px', color: '#111827', margin: 0 }}>{value}</p>
    </div>
  )
}

export default function PatchDetailPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user, logout } = useAuth()

  const [record, setRecord]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── AI state ────────────────────────────────────────
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult]   = useState(null)
  const [aiType, setAiType]       = useState(null)
  const [aiError, setAiError]     = useState(null)

  // ── Load record ─────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await patchService.getById(id)
        setRecord(res.data)
      } catch {
        setError('Record not found or backend not connected.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ── Delete handler ──────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    setDeleting(true)
    try {
      await patchService.remove(id)
      navigate('/')
    } catch {
      alert('Failed to delete. Please try again.')
      setDeleting(false)
    }
  }

  // ── AI request handler ──────────────────────────────
  const handleAiRequest = async (type) => {
    setAiLoading(true)
    setAiResult(null)
    setAiError(null)
    setAiType(type)
    try {
      const res = type === 'describe'
        ? await patchService.getAiDescription(id)
        : await patchService.getAiRecommendation(id)
      setAiResult(res.data)
    } catch {
      setAiError('AI service not connected yet. Available when backend runs.')
    } finally {
      setAiLoading(false)
    }
  }

  // ── Loading state ───────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar user={user} logout={logout} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ width: '36px', height: '36px', border: '4px solid #e5e7eb', borderTopColor: '#1B4F8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </>
    )
  }

  // ── Error / Not found ───────────────────────────────
  if (error || !record) {
    return (
      <>
        <Navbar user={user} logout={logout} />
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <p style={{ color: '#dc2626', fontSize: '15px', marginBottom: '16px' }}>
            {error ?? 'Record not found'}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            ← Back to list
          </button>
        </div>
      </>
    )
  }

  const score      = record.complianceScore
  const scoreColor = score >= 70 ? '#16a34a' : score >= 40 ? '#ca8a04' : '#dc2626'

  return (
    <>
      <Navbar user={user} logout={logout} />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 16px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4F8A', fontSize: '14px', padding: 0 }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0, flex: 1 }}>
            {record.patchTitle}
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate(`/patch/${id}/edit`)}
              style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '7px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '7px 18px', borderRadius: '6px', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: deleting ? 0.7 : 1 }}
            >
              {deleting ? 'Deleting…' : '🗑 Delete'}
            </button>
          </div>
        </div>

        {/* ── Compliance Score Badge ── */}
        {score != null && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: `5px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: scoreColor }}>{score}%</span>
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>
                Compliance Score
              </p>
              <p style={{ fontSize: '13px', color: scoreColor, margin: 0, fontWeight: '600' }}>
                {score >= 70
                  ? '✅ Good — meets compliance threshold'
                  : score >= 40
                    ? '⚠️ Fair — needs improvement'
                    : '🚨 Poor — immediate action required'}
              </p>
            </div>
          </div>
        )}

        {/* ── Status + Severity Badges ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ ...(SEVERITY_STYLE[record.severity] ?? {}), padding: '5px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
            {record.severity}
          </span>
          <span style={{ ...(STATUS_STYLE[record.status] ?? {}), padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            {record.status?.replace('_', ' ')}
          </span>
        </div>

        {/* ── Detail Cards Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Asset Info */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#1B4F8A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px' }}>
              Asset Information
            </p>
            <Field label="Asset Name"  value={record.assetName} />
            <Field label="IP Address"  value={record.assetIp} />
            <Field label="Asset Owner" value={record.assetOwner} />
          </div>

          {/* Patch Info */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#1B4F8A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px' }}>
              Patch Information
            </p>
            <Field label="Patch ID"      value={record.patchId} />
            <Field label="Release Date"  value={record.patchReleaseDate} />
            <Field label="Deadline"      value={record.patchDeadline} />
            <Field label="Patched At"    value={record.patchedAt} />
          </div>

          {/* Description — full width */}
          {record.patchDescription && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#1B4F8A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                Description
              </p>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {record.patchDescription}
              </p>
            </div>
          )}

          {/* Existing AI content from backend — full width */}
          {record.aiDescription && (
            <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', gridColumn: '1 / -1', borderLeft: '4px solid #1B4F8A' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#1B4F8A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                🤖 AI Description
              </p>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {record.aiDescription}
              </p>
            </div>
          )}

          {record.aiRecommendation && (
            <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', gridColumn: '1 / -1', borderLeft: '4px solid #16a34a' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                🤖 AI Recommendation
              </p>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {record.aiRecommendation}
              </p>
            </div>
          )}

        </div>

        {/* ── AI Panel ── */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#1B4F8A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px' }}>
            🤖 AI Analysis
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => handleAiRequest('describe')}
              disabled={aiLoading}
              style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: aiLoading ? 0.7 : 1 }}
            >
              🔍 Describe
            </button>
            <button
              onClick={() => handleAiRequest('recommend')}
              disabled={aiLoading}
              style={{ backgroundColor: '#16a34a', color: 'white', padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: aiLoading ? 0.7 : 1 }}
            >
              💡 Recommend
            </button>
          </div>

          {/* Loading spinner */}
          {aiLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ width: '22px', height: '22px', border: '3px solid #e5e7eb', borderTopColor: '#1B4F8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                AI is analyzing this patch…
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* Error */}
          {aiError && !aiLoading && (
            <div style={{ padding: '14px 16px', background: '#fef9c3', borderRadius: '8px', borderLeft: '4px solid #ca8a04' }}>
              <p style={{ color: '#854d0e', fontSize: '13px', margin: 0 }}>⚠️ {aiError}</p>
            </div>
          )}

          {/* AI Result card */}
          {aiResult && !aiLoading && (
            <div style={{ padding: '16px', background: aiType === 'describe' ? '#eff6ff' : '#f0fdf4', borderRadius: '8px', borderLeft: `4px solid ${aiType === 'describe' ? '#1B4F8A' : '#16a34a'}` }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: aiType === 'describe' ? '#1B4F8A' : '#16a34a', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                {aiType === 'describe' ? '🔍 AI Description' : '💡 AI Recommendation'}
              </p>
              {typeof aiResult === 'string' ? (
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: 0 }}>
                  {aiResult}
                </p>
              ) : (
                <div>
                  {aiResult.description && (
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: '0 0 8px' }}>
                      {aiResult.description}
                    </p>
                  )}
                  {aiResult.recommendation && (
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: 0 }}>
                      {aiResult.recommendation}
                    </p>
                  )}
                  {Array.isArray(aiResult) && aiResult.map((item, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'white', borderRadius: '6px', marginBottom: '8px' }}>
                      <p style={{ fontWeight: '700', color: '#111827', fontSize: '13px', margin: '0 0 4px' }}>
                        {item.action_type}
                      </p>
                      <p style={{ color: '#374151', fontSize: '13px', margin: '0 0 2px' }}>
                        {item.description}
                      </p>
                      {item.priority && (
                        <span style={{ fontSize: '11px', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px' }}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Default empty state */}
          {!aiLoading && !aiResult && !aiError && (
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
              Click "Describe" or "Recommend" to get AI analysis for this patch.
            </p>
          )}
        </div>

        {/* ── Timestamps ── */}
        <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: '8px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
            Created: {record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'}
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
            Updated: {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '—'}
          </p>
        </div>

      </div>
    </>
  )
}