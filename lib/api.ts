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

  // Check if response is JSON before parsing
  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, try to get text
      const text = await response.text();
      throw new Error(text || 'Invalid JSON response');
    }
  } else {
    // If not JSON, get as text
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || 'An error occurred');
    }
    // Try to parse as JSON if it looks like JSON
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || 'Invalid response format');
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'An error occurred');
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
  getFavourites: () => apiRequest('/jobs/favourites'),
  toggleFavourite: (id: string) =>
    apiRequest(`/jobs/${id}/favourite`, {
      method: 'POST',
    }),
  checkFavourite: (id: string) => apiRequest(`/jobs/${id}/favourite`),
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
  togglePublish: () =>
    apiRequest('/cv/toggle-publish', {
      method: 'POST',
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
  getCompanies: () => apiRequest('/admin/companies'),
  getCompany: (id: string) => apiRequest(`/admin/companies/${id}`),
  updateCompany: (id: string, data: any) =>
    apiRequest(`/admin/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCompany: (id: string) =>
    apiRequest(`/admin/companies/${id}`, {
      method: 'DELETE',
    }),
  getJobs: () => apiRequest('/admin/jobs'),
  getJob: (id: string) => apiRequest(`/admin/jobs/${id}`),
  updateJob: (id: string, data: any) =>
    apiRequest(`/admin/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteJob: (id: string) =>
    apiRequest(`/admin/jobs/${id}`, {
      method: 'DELETE',
    }),
  getAuditLogs: (params?: { limit?: number; offset?: number; action?: string; entityType?: string; userId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.userId) queryParams.append('userId', params.userId);
    const query = queryParams.toString();
    return apiRequest(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};

