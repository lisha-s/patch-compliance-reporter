import api from './api'

const authService = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  logout: () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  },
}

export default authService