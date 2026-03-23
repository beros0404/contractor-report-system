const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://contractor-report-system.onrender.com';

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`}`;
  
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Error ${response.status}`);
  }

  return response.json();
}

export const contratosAPI = {
  getPorUsuario: (usuarioId) => 
    apiFetch(`/api/contracts?usuarioId=${usuarioId}`),
  
  getPorId: (id) => 
    apiFetch(`/api/contracts/${id}`),
  
  crear: (data) => 
    apiFetch('/api/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};