export type UserRole = 'admin' | 'operations' | 'client' | 'courier' | 'finance' | 'warehouse';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Order {
  id: string;
  client: string;
  recipient: string;
  status: 'Pendiente' | 'En almacén' | 'En tránsito' | 'Entregado' | 'Cancelado' | 'Nuevo' | 'Confirmado' | 'Novedad';
  phone: string;
  date?: string;
  paymentType?: string;
  cod?: number;
}
