import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWindowSize } from '../hooks/useWindowSize'

export default function Navbar({ activePage }) {
  const navigate       = useNavigate()
  const { user, logout } = useAuth()
  const { isMobile }   = useWindowSize()
  const [menuOpen, setMenuOpen] = useState(false)

 const navLinks = [
  { label: '📋 Records',   path: '/',          key: 'records'   },
  { label: '📊 Dashboard', path: '/dashboard',  key: 'dashboard' },
  { label: '📈 Analytics', path: '/analytics',  key: 'analytics' },
  { label: '🔒 Security',  path: '/security',   key: 'security'  },
]

  return (
    <nav style={{ backgroundColor: '#1B4F8A', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        {/* Logo */}
        <span style={{ color: 'white', fontWeight: '700', fontSize: isMobile ? '14px' : '16px' }}>
          🛡 Patch Compliance Reporter
        </span>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => navigate(link.path)}
                style={{
                  background: activePage === link.key ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: activePage === link.key ? '1px solid rgba(255,255,255,0.5)' : 'none',
                  padding: '5px 14px', borderRadius: '6px',
                  cursor: 'pointer', fontSize: '13px',
                  fontWeight: activePage === link.key ? '700' : '400',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isMobile && user && (
            <span style={{ color: '#bfdbfe', fontSize: '13px' }}>👤 {user.username}</span>
          )}
          {!isMobile && (
            <button
              onClick={logout}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
              Logout
            </button>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '4px' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{ backgroundColor: '#1e4d8c', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px 16px' }}>
          {navLinks.map(link => (
            <button
              key={link.key}
              onClick={() => { navigate(link.path); setMenuOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: activePage === link.key ? 'rgba(255,255,255,0.2)' : 'none',
                color: 'white', border: 'none',
                padding: '10px 12px', borderRadius: '6px',
                cursor: 'pointer', fontSize: '14px', marginBottom: '4px',
                fontWeight: activePage === link.key ? '700' : '400',
              }}
            >
              {link.label}
            </button>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
          {user && <p style={{ color: '#bfdbfe', fontSize: '13px', margin: '0 0 8px 12px' }}>👤 {user.username}</p>}
          <button
            onClick={() => { logout(); setMenuOpen(false) }}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'rgba(255,0,0,0.2)', color: 'white', border: 'none', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}