const API_BASE = '/api'

// 通用请求函数
async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  }

  const res = await fetch(`${API_BASE}${path}`, config)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || '请求失败')
  }

  return data
}

// ============================================
// 认证 API
// ============================================
export const authAPI = {
  register: (email, password, username) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: (userId) =>
    request(`/auth/profile/${userId}`),

  updateProfile: (userId, data) =>
    request(`/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ============================================
// 灵感 API
// ============================================
export const inspirationAPI = {
  create: (data) =>
    request('/inspirations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyList: (userId, page = 1) =>
    request(`/inspirations/my?user_id=${userId}&page=${page}&limit=20`),

  getDetail: (inspirationId) =>
    request(`/inspirations/detail/${inspirationId}`),

  update: (inspirationId, data) =>
    request(`/inspirations/${inspirationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (inspirationId) =>
    request(`/inspirations/${inspirationId}`, {
      method: 'DELETE',
    }),

  getSquare: (tag, page = 1) =>
    request(`/inspirations/square?tag=${tag || ''}&page=${page}&limit=20`),

  search: (query) =>
    request('/inspirations/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  like: (inspirationId, userId) =>
    request(`/inspirations/${inspirationId}/like?user_id=${userId}`, {
      method: 'POST',
    }),

  getComments: (inspirationId) =>
    request(`/inspirations/${inspirationId}/comments`),

  createComment: (inspirationId, userId, content) =>
    request(`/inspirations/${inspirationId}/comments?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
}

// ============================================
// AI API
// ============================================
export const aiAPI = {
  getWakeup: (userId) =>
    request(`/ai/wakeup/${userId}`),

  getRelated: (inspirationId) =>
    request(`/ai/related/${inspirationId}`),

  getMatches: (userId) =>
    request(`/ai/matches/${userId}`),
}
