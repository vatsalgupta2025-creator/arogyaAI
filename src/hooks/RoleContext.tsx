import { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'patient' | 'caregiver' | 'physician';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  roleLabel: string;
  roleColor: string;
}

const RoleContext = createContext<RoleContextType>({
  role: 'physician',
  setRole: () => {},
  roleLabel: 'Physician',
  roleColor: '#60a5fa',
});

const roleMap: Record<Role, { label: string; color: string }> = {
  patient: { label: 'Patient View', color: '#34d399' },
  caregiver: { label: 'Caregiver View', color: '#fbbf24' },
  physician: { label: 'Physician View', color: '#60a5fa' },
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('physician');

  return (
    <RoleContext.Provider value={{
      role,
      setRole,
      roleLabel: roleMap[role].label,
      roleColor: roleMap[role].color,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
