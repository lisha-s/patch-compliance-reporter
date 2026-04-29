import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import patchService from '../services/patchService'

// ── Validation rules ──────────────────────────────────
const validate = (form) => {
  const errors = {}
  if (!form.assetName.trim())
    errors.assetName = 'Asset name is required'
  if (!form.patchId.trim())
    errors.patchId = 'Patch ID is required'
  if (!form.patchTitle.trim())
    errors.patchTitle = 'Patch title is required'
  if (form.complianceScore !== '' && (isNaN(form.complianceScore) || form.complianceScore < 0 || form.complianceScore > 100))
    errors.complianceScore = 'Score must be a number between 0 and 100'
  if (form.patchDeadline && form.patchReleaseDate && form.patchDeadline < form.patchReleaseDate)
    errors.patchDeadline = 'Deadline cannot be before release date'
  return errors
}

const EMPTY_FORM = {
  assetName:       '',
  assetIp:         '',
  assetOwner:      '',
  patchId:         '',
  patchTitle:      '',
  patchDescription:'',
  severity:        'MEDIUM',
  status:          'PENDING',
  complianceScore: '',
  patchReleaseDate:'',
  patchDeadline:   '',
}

export default function PatchFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id && id !== 'new')

  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [serverError, setServerError] = useState(null)

  // ── If editing, load existing record ─────────────
  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await patchService.getById(id)
        const d = res.data
        setForm({
          assetName:        d.assetName        ?? '',
          assetIp:          d.assetIp          ?? '',
          assetOwner:       d.assetOwner       ?? '',
          patchId:          d.patchId          ?? '',
          patchTitle:       d.patchTitle       ?? '',
          patchDescription: d.patchDescription ?? '',
          severity:         d.severity         ?? 'MEDIUM',
          status:           d.status           ?? 'PENDING',
          complianceScore:  d.complianceScore  ?? '',
          patchReleaseDate: d.patchReleaseDate ?? '',
          patchDeadline:    d.patchDeadline    ?? '',
        })
      } catch {
        setServerError('Could not load record. It may not exist.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  // ── Handle input change ───────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear the error for this field as user types
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  // ── Handle submit ─────────────────────────────────
  const handleSubmit = async () => {
    setServerError(null)
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        complianceScore: form.complianceScore === '' ? null : Number(form.complianceScore),
        patchReleaseDate: form.patchReleaseDate || null,
        patchDeadline:    form.patchDeadline    || null,
      }
      if (isEdit) {
        await patchService.update(id, payload)
      } else {
        await patchService.create(payload)
      }
      navigate('/')
    } catch (err) {
      setServerError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Handle soft delete ────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await patchService.remove(id)
      navigate('/')
    } catch {
      setServerError('Failed to delete record.')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#6b7280' }}>Loading record…</p>
      </div>
    )
  }

  // ── Shared input style ────────────────────────────
  const inputStyle = (field) => ({
    width: '100%',
    padding: '9px 12px',
    border: `1px solid ${errors[field] ? '#dc2626' : '#d1d5db'}`,
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    background: 'white',
  })

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '5px',
  }

  const errorStyle = {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
  }

  const fieldWrap = { marginBottom: '18px' }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4F8A', fontSize: '14px', padding: 0 }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          {isEdit ? 'Edit Patch Record' : 'New Patch Record'}
        </h1>
        {isEdit && (
          <button
            onClick={handleDelete}
            style={{ marginLeft: 'auto', background: '#fee2e2', color: '#991b1b', border: 'none', padding: '7px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            🗑 Delete
          </button>
        )}
      </div>

      {/* Server error banner */}
      {serverError && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          {serverError}
        </div>
      )}

      {/* Form card */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>

        {/* Section: Asset Info */}
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#1B4F8A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', marginTop: 0 }}>
          Asset Information
        </p>

        {/* Row: assetName + assetIp */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Asset Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input name="assetName" value={form.assetName} onChange={handleChange} placeholder="e.g. web-server-01" style={inputStyle('assetName')} />
            {errors.assetName && <p style={errorStyle}>{errors.assetName}</p>}
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Asset IP Address</label>
            <input name="assetIp" value={form.assetIp} onChange={handleChange} placeholder="e.g. 192.168.1.10" style={inputStyle('assetIp')} />
          </div>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Asset Owner</label>
          <input name="assetOwner" value={form.assetOwner} onChange={handleChange} placeholder="e.g. DevOps Team" style={inputStyle('assetOwner')} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '8px 0 20px' }} />

        {/* Section: Patch Info */}
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#1B4F8A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', marginTop: 0 }}>
          Patch Information
        </p>

        {/* Row: patchId + patchTitle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Patch ID <span style={{ color: '#dc2626' }}>*</span></label>
            <input name="patchId" value={form.patchId} onChange={handleChange} placeholder="e.g. CVE-2024-1234" style={inputStyle('patchId')} />
            {errors.patchId && <p style={errorStyle}>{errors.patchId}</p>}
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Patch Title <span style={{ color: '#dc2626' }}>*</span></label>
            <input name="patchTitle" value={form.patchTitle} onChange={handleChange} placeholder="e.g. Windows Security Update March 2024" style={inputStyle('patchTitle')} />
            {errors.patchTitle && <p style={errorStyle}>{errors.patchTitle}</p>}
          </div>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Description</label>
          <textarea
            name="patchDescription"
            value={form.patchDescription}
            onChange={handleChange}
            placeholder="Describe what this patch fixes..."
            rows={3}
            style={{ ...inputStyle('patchDescription'), resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Row: severity + status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Severity <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="severity" value={form.severity} onChange={handleChange} style={inputStyle('severity')}>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
              <option value="INFO">INFO</option>
            </select>
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Status <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="status" value={form.status} onChange={handleChange} style={inputStyle('status')}>
              <option value="PENDING">PENDING</option>
              <option value="COMPLIANT">COMPLIANT</option>
              <option value="NON_COMPLIANT">NON_COMPLIANT</option>
              <option value="EXEMPT">EXEMPT</option>
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '8px 0 20px' }} />

        {/* Section: Dates & Score */}
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#1B4F8A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', marginTop: 0 }}>
          Dates & Compliance Score
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Release Date</label>
            <input type="date" name="patchReleaseDate" value={form.patchReleaseDate} onChange={handleChange} style={inputStyle('patchReleaseDate')} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Deadline</label>
            <input type="date" name="patchDeadline" value={form.patchDeadline} onChange={handleChange} style={inputStyle('patchDeadline')} />
            {errors.patchDeadline && <p style={errorStyle}>{errors.patchDeadline}</p>}
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Compliance Score (0–100)</label>
            <input type="number" name="complianceScore" value={form.complianceScore} onChange={handleChange} placeholder="e.g. 85" min="0" max="100" style={inputStyle('complianceScore')} />
            {errors.complianceScore && <p style={errorStyle}>{errors.complianceScore}</p>}
          </div>
        </div>

        {/* Submit button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: '1px solid #d1d5db', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginRight: '12px', color: '#374151' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '10px 28px', borderRadius: '6px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Record'}
          </button>
        </div>
      </div>
    </div>
  )
}