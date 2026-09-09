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
  // Worker session (isolated from Admin)
  const [workerUser, setWorkerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jh_worker_user');
      return saved ? JSON.parse(saved) : ROLES.WORKER;
    } catch {
      return ROLES.WORKER;
    }
  });

  // Admin session (isolated from Worker)
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jh_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('jh_safety_role') || 'WORKER';
  });

  useEffect(() => {
    localStorage.setItem('jh_safety_role', currentRole);
  }, [currentRole]);

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
      return { success: false, error: err.message };
    }
  };

  // Worker Logout Handler
  const logoutWorker = () => {
    localStorage.removeItem('jh_worker_token');
    localStorage.removeItem('jh_worker_user');
    setWorkerUser(null);
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
      return { success: false, error: err.message };
    }
  };

  // Admin Logout Handler
  const logoutAdmin = () => {
    localStorage.removeItem('jh_admin_token');
    localStorage.removeItem('jh_admin_user');
    setAdminUser(null);
  };

  const switchRole = (roleKey) => {
    if (ROLES[roleKey]) {
      setCurrentRole(roleKey);
      if (adminUser) {
        const updatedAdmin = { ...adminUser, role: roleKey };
        setAdminUser(updatedAdmin);
        localStorage.setItem('jh_admin_user', JSON.stringify(updatedAdmin));
      }
    }
  };

  // Compute active currentUser based on role/session
  const currentUser = adminUser && currentRole !== 'WORKER'
    ? { ...ROLES[currentRole], ...adminUser }
    : (workerUser || ROLES.WORKER);

  return (
    <AuthContext.Provider value={{
      currentRole,
      currentUser,
      workerUser,
      adminUser,
      isWorkerAuthenticated: !!workerUser,
      isAdminAuthenticated: !!adminUser,
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
