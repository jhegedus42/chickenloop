const API_BASE = '/api';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

export const authApi = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
  me: () => apiRequest('/auth/me'),
};

export const jobsApi = {
  getAll: () => apiRequest('/jobs'),
  getOne: (id: string) => apiRequest(`/jobs/${id}`),
  getMyJobs: () => apiRequest('/jobs/my'),
  create: (data: any) =>
    apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/jobs/${id}`, {
      method: 'DELETE',
    }),
};

export const cvApi = {
  get: () => apiRequest('/cv'),
  create: (data: any) =>
    apiRequest('/cv', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: any) =>
    apiRequest('/cv', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: () =>
    apiRequest('/cv', {
      method: 'DELETE',
    }),
};

export const companyApi = {
  get: () => apiRequest('/company'),
  create: (data: any) =>
    apiRequest('/company', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (data: any) =>
    apiRequest('/company', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const adminApi = {
  getUsers: () => apiRequest('/admin/users'),
  getUser: (id: string) => apiRequest(`/admin/users/${id}`),
  updateUser: (id: string, data: any) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};

