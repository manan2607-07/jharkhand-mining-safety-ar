/**
 * Unified Hardened API Client for Jharkhand AR Mining Safety Platform
 * Automatically manages JWT authorization headers and session expiration
 */

export function getActiveAuthToken() {
  if (typeof window === 'undefined') return null;
  const adminToken = localStorage.getItem('jh_admin_token');
  const workerToken = localStorage.getItem('jh_worker_token');
  
  // If in admin hash route or admin token exists, prioritize adminToken
  const hash = window.location.hash || '';
  if (hash.startsWith('#admin') && adminToken) {
    return adminToken;
  }
  
  return adminToken || workerToken || null;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  // Automatically attach Bearer token if not explicitly provided
  if (!headers['Authorization'] && !headers['authorization']) {
    const token = getActiveAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Set Content-Type to application/json by default when sending JSON bodies
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    ...options,
    headers
  };

  try {
    const response = await fetch(endpoint, fetchOptions);

    // Handle token expiration or revocation — only wipe session if it's an explicit auth verification failure
    if (response.status === 401 && headers['Authorization']) {
      const isExplicitAuthCheck = endpoint.includes('/api/auth/me') || endpoint.includes('/api/auth/validate');
      if (isExplicitAuthCheck) {
        console.warn(`[AUTH] Session expired or invalid on ${endpoint}. Clearing credentials.`);
        if (window.location.hash.startsWith('#admin')) {
          localStorage.removeItem('jh_admin_token');
          localStorage.removeItem('jh_admin_user');
        } else {
          localStorage.removeItem('jh_worker_token');
          localStorage.removeItem('jh_worker_user');
        }
        window.dispatchEvent(new CustomEvent('jh-auth-session-expired'));
      } else {
        console.warn(`[AUTH] Non-critical 401 received on ${endpoint}. Preserving active shift session.`);
      }
    }

    return response;
  } catch (error) {
    console.error(`[API ERROR] Network failure calling ${endpoint}:`, error);
    throw error;
  }
}

export default apiFetch;
