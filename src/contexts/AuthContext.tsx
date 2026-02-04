import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios demo para testing
interface DemoUser extends User {
  password: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@jetsmart.com',
    password: 'password123',
    role: 'ADMINISTRADOR',
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: '2',
    name: 'Supervisor Principal',
    email: 'supervisor@jetsmart.com',
    password: 'password123',
    role: 'SUPERVISOR',
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: '3',
    name: 'Aeropuerto ATO',
    email: 'ato@jetsmart.com',
    password: 'password123',
    role: 'AEROPUERTO_ATO',
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: '4',
    name: 'Soporte CC',
    email: 'soportecc@jetsmart.com',
    password: 'password123',
    role: 'SOPORTE_CC',
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('gds_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('gds_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = DEMO_USERS.find(
      u => u.email === email && u.password === password && u.isActive
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('gds_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gds_user');
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasRole,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
