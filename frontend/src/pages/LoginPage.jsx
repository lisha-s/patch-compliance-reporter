import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const navigate  = useNavigate()
  const { login } = useAuth()

  const handleLogin = async () => {
    // Basic front-end validation
    if (!username.trim()) { setError('Username is required'); return }
    if (!password.trim()) { setError('Password is required'); return }

    setError(null)
    setLoading(true)
    try {
      const res = await authService.login(username, password)
      // res.data.token comes from Spring Boot JWT response
      login(res.data.token)
      navigate('/')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password.')
      } else if (err.response?.status === 0 || !err.response) {
        setError('Cannot connect to server. Is the backend running?')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '52px', height: '52px', backgroundColor: '#1B4F8A', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'white', fontSize: '22px' }}>🛡</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Patch Compliance Reporter
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
            Sign in to your account
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Form fields */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', backgroundColor: loading ? '#93afc8' : '#1B4F8A', color: 'white', padding: '11px', borderRadius: '7px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '15px' }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

      </div>
    </div>
  )
}