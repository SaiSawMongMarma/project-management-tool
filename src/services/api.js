const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('orbit_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || 'Request failed');
  return response.json();
}

export const authApi = {
  login: (payload) => api('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => api('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => api('/me'),
};

export const projectApi = {
  list: () => api('/projects'),
  create: (payload) => api('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  tasks: (projectId) => api(`/projects/${projectId}/tasks`),
  createTask: (projectId, payload) => api(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(payload) }),
};

export const taskApi = {
  update: (taskId, payload) => api(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  comments: (taskId) => api(`/tasks/${taskId}/comments`),
  addComment: (taskId, body) => api(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
};
