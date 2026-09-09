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
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('jh_safety_role') || 'WORKER';
  });

  const currentUser = ROLES[currentRole] || ROLES.WORKER;

  useEffect(() => {
    localStorage.setItem('jh_safety_role', currentRole);
  }, [currentRole]);

  const switchRole = (roleKey) => {
    if (ROLES[roleKey]) {
      setCurrentRole(roleKey);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentRole,
      currentUser,
      switchRole,
      ROLES
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
