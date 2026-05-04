import api from './api'

// ── Demo data shown when backend is offline ────────────
const DEMO_RECORDS = {
  content: [
    { id: 1,  assetName: 'web-server-01',   assetIp: '192.168.1.10', patchId: 'CVE-2024-1234', patchTitle: 'OpenSSL Critical Vulnerability Fix',    severity: 'CRITICAL', status: 'NON_COMPLIANT', complianceScore: 25,  patchDeadline: '2024-03-15' },
    { id: 2,  assetName: 'db-server-01',    assetIp: '192.168.1.20', patchId: 'CVE-2024-5678', patchTitle: 'PostgreSQL Authentication Bypass',       severity: 'CRITICAL', status: 'PENDING',       complianceScore: 40,  patchDeadline: '2024-03-20' },
    { id: 3,  assetName: 'app-server-01',   assetIp: '192.168.1.30', patchId: 'KB5034441',     patchTitle: 'Windows Server 2022 Security Update',   severity: 'HIGH',     status: 'COMPLIANT',     complianceScore: 90,  patchDeadline: '2024-02-28' },
    { id: 4,  assetName: 'app-server-02',   assetIp: '192.168.1.31', patchId: 'KB5034442',     patchTitle: 'Windows Server 2019 Cumulative Update', severity: 'HIGH',     status: 'COMPLIANT',     complianceScore: 85,  patchDeadline: '2024-02-28' },
    { id: 5,  assetName: 'mail-server-01',  assetIp: '192.168.1.40', patchId: 'CVE-2024-2345', patchTitle: 'Exchange Server Remote Code Execution',  severity: 'CRITICAL', status: 'NON_COMPLIANT', complianceScore: 10,  patchDeadline: '2024-03-25' },
    { id: 6,  assetName: 'file-server-01',  assetIp: '192.168.1.50', patchId: 'CVE-2024-3456', patchTitle: 'SMB Protocol Vulnerability',             severity: 'HIGH',     status: 'COMPLIANT',     complianceScore: 80,  patchDeadline: '2024-02-15' },
    { id: 7,  assetName: 'api-gateway-01',  assetIp: '10.0.0.1',     patchId: 'CVE-2024-4567', patchTitle: 'Nginx HTTP/2 Rapid Reset Attack',        severity: 'HIGH',     status: 'COMPLIANT',     complianceScore: 75,  patchDeadline: '2024-03-05' },
    { id: 8,  assetName: 'cache-server-01', assetIp: '10.0.0.10',    patchId: 'CVE-2024-6789', patchTitle: 'Redis Unauthenticated Access',           severity: 'MEDIUM',   status: 'PENDING',       complianceScore: 55,  patchDeadline: '2024-04-01' },
    { id: 9,  assetName: 'dev-server-01',   assetIp: '192.168.2.10', patchId: 'CVE-2024-7890', patchTitle: 'Java Log4j Remote Code Execution',       severity: 'CRITICAL', status: 'COMPLIANT',     complianceScore: 95,  patchDeadline: '2024-01-31' },
    { id: 10, assetName: 'vpn-server-01',   assetIp: '10.0.1.1',     patchId: 'CVE-2024-9012', patchTitle: 'VPN Client Buffer Overflow',             severity: 'HIGH',     status: 'NON_COMPLIANT', complianceScore: 30,  patchDeadline: '2024-04-05' },
  ],
  totalPages: 2,
  totalElements: 15,
  number: 0,
}

const DEMO_STATS = {
  total: 15, compliant: 7, nonCompliant: 4, pending: 3,
  avgScore: 64,
  bySeverity: [
    { severity: 'CRITICAL', count: 5 },
    { severity: 'HIGH',     count: 4 },
    { severity: 'MEDIUM',   count: 4 },
    { severity: 'LOW',      count: 1 },
    { severity: 'INFO',     count: 1 },
  ]
}

const DEMO_RECORD = {
  id: 1, assetName: 'web-server-01', assetIp: '192.168.1.10',
  assetOwner: 'DevOps Team', patchId: 'CVE-2024-1234',
  patchTitle: 'OpenSSL Critical Vulnerability Fix',
  patchDescription: 'A critical vulnerability in OpenSSL allows remote attackers to execute arbitrary code via a crafted certificate chain.',
  severity: 'CRITICAL', status: 'NON_COMPLIANT', complianceScore: 25,
  patchReleaseDate: '2024-03-01', patchDeadline: '2024-03-15',
  aiDescription: 'This patch addresses a critical heap buffer overflow in OpenSSL that could allow an attacker to execute arbitrary code remotely.',
  aiRecommendation: 'Apply this patch immediately. Prioritise all internet-facing servers first.',
  createdAt: '2024-03-01T10:00:00', updatedAt: '2024-03-10T14:30:00',
}

// ── Try real API, fall back to demo data ──────────────
async function tryApi(apiFn, demoData) {
  try {
    return await apiFn()
  } catch {
    return { data: demoData }
  }
}

const patchService = {
  getAll: (page = 0, size = 10) =>
    tryApi(() => api.get('/patch-records', { params: { page, size } }), DEMO_RECORDS),

  getById: (id) =>
    tryApi(() => api.get(`/patch-records/${id}`), DEMO_RECORD),

  create: (data) =>
    api.post('/patch-records', data),

  update: (id, data) =>
    api.put(`/patch-records/${id}`, data),

  remove: (id) =>
    api.delete(`/patch-records/${id}`),

  search: (q) =>
    tryApi(() => api.get('/patch-records/search', { params: { q } }), []),

  getStats: () =>
    tryApi(() => api.get('/patch-records/stats'), DEMO_STATS),

  exportCsv: () =>
    api.get('/patch-records/export', { responseType: 'blob' }),

  getAiDescription: (id) =>
    api.post(`/patch-records/${id}/describe`),

  getAiRecommendation: (id) =>
    api.post(`/patch-records/${id}/recommend`),
}

export default patchService