import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <>
      <Navbar activePage="" />
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '0 16px' }}>
        <p style={{ fontSize: '72px', margin: '0 0 8px' }}>🔍</p>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px' }}>404</h1>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px' }}>Page not found</p>
        <button
          onClick={() => navigate('/')}
          style={{ backgroundColor: '#1B4F8A', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}
        >
          ← Back to Home
        </button>
      </div>
    </>
  )
}