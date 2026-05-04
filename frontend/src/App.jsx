import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PatchListPage    from './pages/PatchListPage'
import PatchDetailPage  from './pages/PatchDetailPage'
import PatchFormPage    from './pages/PatchFormPage'
import DashboardPage    from './pages/DashboardPage'
import AnalyticsPage    from './pages/AnalyticsPage'
import LoginPage        from './pages/LoginPage'
import NotFoundPage     from './pages/NotFoundPage'
import SecurityDemoPage from './pages/SecurityDemoPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/"               element={<ProtectedRoute><PatchListPage /></ProtectedRoute>} />
        <Route path="/dashboard"      element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/analytics"      element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/security"       element={<ProtectedRoute><SecurityDemoPage /></ProtectedRoute>} />
        <Route path="/patch/new"      element={<ProtectedRoute><PatchFormPage /></ProtectedRoute>} />
        <Route path="/patch/:id/edit" element={<ProtectedRoute><PatchFormPage /></ProtectedRoute>} />
        <Route path="/patch/:id"      element={<ProtectedRoute><PatchDetailPage /></ProtectedRoute>} />
        <Route path="/404"            element={<NotFoundPage />} />
        <Route path="*"               element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App