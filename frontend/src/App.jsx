import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PatchListPage   from './pages/PatchListPage'
import PatchDetailPage from './pages/PatchDetailPage'
import PatchFormPage   from './pages/PatchFormPage'
import DashboardPage   from './pages/DashboardPage'
import LoginPage       from './pages/LoginPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><PatchListPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/patch/new" element={<ProtectedRoute><PatchFormPage /></ProtectedRoute>} />
        <Route path="/patch/:id/edit" element={<ProtectedRoute><PatchFormPage /></ProtectedRoute>} />
        <Route path="/patch/:id" element={<ProtectedRoute><PatchDetailPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App