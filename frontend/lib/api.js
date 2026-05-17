const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('devblog_token');
};

const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const authAPI = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiFetch('/auth/me'),
  updateProfile: (body) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

// Posts
export const postsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/posts${qs ? '?' + qs : ''}`);
  },
  getOne: (slug) => apiFetch(`/posts/${slug}`),
  create: (body) => apiFetch('/posts', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
  like: (id) => apiFetch(`/posts/${id}/like`, { method: 'POST' }),
};

// Comments
export const commentsAPI = {
  getByPost: (postId) => apiFetch(`/posts/${postId}/comments`),
  create: (postId, body) => apiFetch(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => apiFetch(`/comments/${id}`, { method: 'DELETE' }),
};

// Tags
export const tagsAPI = {
  getAll: () => apiFetch('/tags'),
  getOne: (slug) => apiFetch(`/tags/${slug}`),
  follow: (id) => apiFetch(`/tags/${id}/follow`, { method: 'POST' }),
};
