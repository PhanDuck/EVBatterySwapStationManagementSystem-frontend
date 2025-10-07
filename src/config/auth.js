// Simple auth utilities for token and user role handling
export const getToken = () => {
  try {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  } catch {
    return null;
  }
};

export const setToken = (token, remember) => {
  try {
    if (remember) {
      localStorage.setItem('authToken', token);
      sessionStorage.removeItem('authToken');
    } else {
      sessionStorage.setItem('authToken', token);
      localStorage.removeItem('authToken');
    }
  } catch {
    // ignore
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  } catch {
    // ignore
  }
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getCurrentRole = () => {
  const user = getCurrentUser();
  if (!user) return null;
  // Common fields from different backends
  let candidate = user.role || user.Role || user.userRole || user.roleName || user.RoleName;
  if (!candidate && Array.isArray(user.roles) && user.roles.length > 0) {
    candidate = user.roles[0];
  }
  if (!candidate && Array.isArray(user.authorities) && user.authorities.length > 0) {
    const first = user.authorities[0];
    candidate = typeof first === 'string' ? first : (first?.authority || first?.name || first?.role);
  }
  if (!candidate) return null;
  const upper = String(candidate).toUpperCase();
  if (upper.includes('ADMIN')) return 'Admin';
  if (upper.includes('STAFF')) return 'Staff';
  if (upper.includes('DRIVER')) return 'Driver';
  return candidate;
};

export const isAuthenticated = () => !!getToken();


