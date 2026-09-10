import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES = {
  WORKER: {
    id: 'WRK-1000',
    userId: 'USR-WORKER-01',
    role: 'WORKER',
    name: 'Birsa Hansda (ᱵᱤᱨᱥᱟ ᱦᱟᱸᱥᱫᱟ)',
    designation: 'Underground Coal Driller',
    workerCode: 'JH-WRK-001',
    siteId: 'SITE-DHN-01',
    siteName: 'BCCL Jharia Underground Coal Mine Colliery #4',
    district: 'Dhanbad',
    sector: 'COAL'
  },
  SAFETY_OFFICER: {
    id: 'USR-OFFICER-01',
    role: 'SAFETY_OFFICER',
    name: 'Rajesh Mahato',
    designation: 'Site Safety Supervisor',
    workerCode: 'SO-DHN-99',
    siteId: 'SITE-DHN-01',
    siteName: 'BCCL Jharia Underground Coal Mine Colliery #4',
    district: 'Dhanbad',
    sector: 'COAL'
  },
  DGMS_INSPECTOR: {
    id: 'USR-DGMS-01',
    role: 'DGMS_INSPECTOR',
    name: 'Dr. A.K. Sengupta',
    designation: 'Director of Mine Safety (Statutory Inspector)',
    workerCode: 'DGMS-HQ-041',
    siteId: null,
    siteName: 'DGMS Dhanbad Headquarters',
    district: 'Dhanbad',
    sector: 'ALL'
  },
  STATE_NODAL_OFFICER: {
    id: 'USR-STATE-01',
    role: 'STATE_NODAL_OFFICER',
    name: 'Priya Soren',
    designation: 'State Nodal Officer - Mines & Geology',
    workerCode: 'GOV-JH-MINES-01',
    siteId: null,
    siteName: 'Dept. of Mines & Geology (खान एवं भूतत्व विभाग), Ranchi',
    district: 'Ranchi',
    sector: 'STATE_WIDE'
  }
};

export const AuthProvider = ({ children }) => {
  // Worker session (isolated from Admin, strictly requires token and saved user)
  const [workerUser, setWorkerUser] = useState(() => {
    try {
      const token = localStorage.getItem('jh_worker_token');
      const saved = localStorage.getItem('jh_worker_user');
      // Reject offline-generated fake tokens
      if (token && token.startsWith('offline-')) {
        localStorage.removeItem('jh_worker_token');
        localStorage.removeItem('jh_worker_user');
        return null;
      }
      return token && saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin session (isolated from Worker, strictly requires token and saved user)
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const token = localStorage.getItem('jh_admin_token');
      const saved = localStorage.getItem('jh_admin_user');
      // Reject offline-generated fake tokens
      if (token && token.startsWith('offline-')) {
        localStorage.removeItem('jh_admin_token');
        localStorage.removeItem('jh_admin_user');
        return null;
      }
      return token && saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedAdmin = localStorage.getItem('jh_admin_user');
      if (savedAdmin) return JSON.parse(savedAdmin).role;
      const savedWorker = localStorage.getItem('jh_worker_user');
      if (savedWorker) return 'WORKER';
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (adminUser) {
      setCurrentRole(adminUser.role);
    } else if (workerUser) {
      setCurrentRole('WORKER');
    } else {
      setCurrentRole(null);
    }
  }, [adminUser, workerUser]);

  // Listen for session expiration events from the API client
  useEffect(() => {
    const handleSessionExpired = () => {
      // Clear all auth state when the server rejects a token
      const hash = window.location.hash || '';
      if (hash.startsWith('#admin')) {
        setAdminUser(null);
      } else {
        setWorkerUser(null);
      }
    };
    window.addEventListener('jh-auth-session-expired', handleSessionExpired);
    return () => window.removeEventListener('jh-auth-session-expired', handleSessionExpired);
  }, []);

  // Worker Login Handler
  const loginWorker = async (credentials) => {
    try {
      const res = await fetch('/api/auth/worker-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Worker authentication failed');
      }

      localStorage.setItem('jh_worker_token', data.token);
      localStorage.setItem('jh_worker_user', JSON.stringify(data.worker));
      setWorkerUser(data.worker);
      setCurrentRole('WORKER');
      return { success: true, worker: data.worker };
    } catch (err) {
      // No offline fallback — security: offline auth bypass removed
      // If network is unavailable, login fails gracefully
      return { success: false, error: err.message || 'Unable to connect to server. Please check your network connection.' };
    }
  };

  // Worker Logout Handler
  const logoutWorker = async () => {
    // Attempt server-side token revocation
    try {
      const token = localStorage.getItem('jh_worker_token');
      if (token && !token.startsWith('offline-')) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch {
      // Logout should always succeed client-side even if server is unreachable
    }
    localStorage.removeItem('jh_worker_token');
    localStorage.removeItem('jh_worker_user');
    setWorkerUser(null);
    setCurrentRole(null);
  };

  // Admin Login Handler
  const loginAdmin = async (credentials) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Administrative authentication failed');
      }

      localStorage.setItem('jh_admin_token', data.token);
      localStorage.setItem('jh_admin_user', JSON.stringify(data.admin));
      setAdminUser(data.admin);
      setCurrentRole(data.admin.role);
      return { success: true, admin: data.admin };
    } catch (err) {
      // No offline fallback — security: hardcoded admin credentials removed
      return { success: false, error: err.message || 'Unable to connect to server. Please check your network connection.' };
    }
  };

  // Admin Logout Handler
  const logoutAdmin = async () => {
    // Attempt server-side token revocation
    try {
      const token = localStorage.getItem('jh_admin_token');
      if (token && !token.startsWith('offline-')) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch {
      // Logout should always succeed client-side even if server is unreachable
    }
    localStorage.removeItem('jh_admin_token');
    localStorage.removeItem('jh_admin_user');
    setAdminUser(null);
    setCurrentRole(null);
  };

  // switchRole is restricted: an admin CANNOT change their statutory role
  const switchRole = (roleKey) => {
    // Role switching is disallowed for security; roles are immutable per login session
    if (!adminUser && !workerUser) return;
  };

  // Compute active currentUser strictly from authenticated state
  const currentUser = adminUser
    ? { ...(ROLES[adminUser.role] || {}), ...adminUser, name: adminUser.fullName || adminUser.name }
    : (workerUser ? { ...ROLES.WORKER, ...workerUser, name: workerUser.name || workerUser.fullName } : null);

  return (
    <AuthContext.Provider value={{
      currentRole,
      currentUser,
      workerUser,
      adminUser,
      isWorkerAuthenticated: !!workerUser && !!localStorage.getItem('jh_worker_token'),
      isAdminAuthenticated: !!adminUser && !!localStorage.getItem('jh_admin_token'),
      loginWorker,
      logoutWorker,
      loginAdmin,
      logoutAdmin,
      switchRole,
      ROLES
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
