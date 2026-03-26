// Tipos de Usuario y Autenticación

export type UserRole =
  | 'ADMINISTRADOR'
  | 'SUPERVISOR'
  | 'AEROPUERTO_ATO'
  | 'SOPORTE_CC';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthUser extends User {
  token?: string;
}

// Credenciales de demo
export const DEMO_USERS = [
  {
    id: '1',
    name: 'Administrador del Sistema',
    email: 'admin@jetsmart.com',
    password: 'password123',
    role: 'ADMINISTRADOR' as UserRole,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    name: 'Supervisor de Proceso',
    email: 'supervisor@jetsmart.com',
    password: 'password123',
    role: 'SUPERVISOR' as UserRole,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '3',
    name: 'Aeropuerto ATO',
    email: 'ato@jetsmart.com',
    password: 'password123',
    role: 'AEROPUERTO_ATO' as UserRole,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '4',
    name: 'Soporte CC',
    email: 'soportecc@jetsmart.com',
    password: 'password123',
    role: 'SOPORTE_CC' as UserRole,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
];





