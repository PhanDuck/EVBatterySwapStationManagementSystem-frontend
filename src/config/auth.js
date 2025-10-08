// Simple auth utilities for token and user role handling

// ======================= TOKEN HANDLER =======================

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

// ======================= USER HANDLER =======================

// BỔ SUNG QUAN TRỌNG: LƯU THÔNG TIN USER VÀO LOCAL STORAGE
export const setCurrentUser = (user) => {
  try {
    // Thông tin user nên luôn được lưu vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
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

// ======================= CLEAR & STATUS =======================

export const clearAuth = () => {
  try {
    // Xóa cả Token và User
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('currentUser'); 
  } catch {
    // ignore
  }
};

export const isAuthenticated = () => !!getToken();

// ======================= ROLE HANDLER =======================

export const getCurrentRole = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  // Logic tìm kiếm vai trò linh hoạt
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
  
  // Ánh xạ vai trò chính
  if (upper.includes('ADMIN')) return 'Admin';
  if (upper.includes('STAFF')) return 'Staff';
  if (upper.includes('DRIVER')) return 'Driver';
  
  return candidate;
};