import type { User, Order, UserRole } from './types';

export const mockUsers: Record<UserRole, User> = {
  admin: {
    name: 'Admin User',
    email: 'admin@khlothia.pack',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/admin/100/100'
  },
  operations: {
    name: 'Operations User',
    email: 'ops@khlothia.pack',
    role: 'operations',
    avatarUrl: 'https://picsum.photos/seed/ops/100/100'
  },
  client: {
    name: 'Client User',
    email: 'client@khlothia.pack',
    role: 'client',
    avatarUrl: 'https://picsum.photos/seed/client/100/100'
  },
  courier: {
    name: 'Courier User',
    email: 'courier@khlothia.pack',
    role: 'courier',
    avatarUrl: 'https://picsum.photos/seed/courier/100/100'
  },
  finance: {
    name: 'Finance User',
    email: 'finance@khlothia.pack',
    role: 'finance',
    avatarUrl: 'https://picsum.photos/seed/finance/100/100'
  },
  warehouse: {
    name: 'Warehouse User',
    email: 'warehouse@khlothia.pack',
    role: 'warehouse',
    avatarUrl: 'https://picsum.photos/seed/warehouse/100/100'
  }
};

export const mockOrders: Order[] = [
  { id: 'KP001', client: 'Tienda A', recipient: 'Juan Pérez', status: 'En tránsito', phone: '18095551234' },
  { id: 'KP002', client: 'Tienda B', recipient: 'Maria Rodriguez', status: 'Entregado', phone: '18295555678' },
  { id: 'KP003', client: 'Tienda C', recipient: 'Carlos Gómez', status: 'En almacén', phone: '18495559012' },
  { id: 'KP004', client: 'Tienda A', recipient: 'Ana Martinez', status: 'Pendiente', phone: '18095553456' },
  { id: 'KP005', client: 'Tienda D', recipient: 'Luis Fernandez', status: 'Cancelado', phone: '18295557890' },
  { id: 'KP006', client: 'Tienda B', recipient: 'Sofia Hernandez', status: 'En tránsito', phone: '18495551122' },
];
