export type UserRole = 'admin' | 'operations' | 'client' | 'courier' | 'finance' | 'warehouse';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export type OrderStatus =
  | 'Generado'
  | 'Confirmado'
  | 'Confirmado para la tarde'
  | 'Coordinado'
  | 'En Ruta'
  | 'Entregado'
  | 'Novedad'
  | 'Pendiente Respuesta'
  | 'Llamar'
  | 'Reprogramado'
  | 'Cancelado'
  | 'Anulado'
  | 'Indemnización'
  | 'Devolución'
  // Legacy/variant statuses from Kanban definition
  | 'ENVIADO' // -> En Almacén
  | 'CONFIRMADO SIN STOCK'
  | 'ENTREGADO' // variant of Entregado
  | 'NOVEDAD 2'
  | 'Sin respuestas'
  | 'NO RECOGIDO'
  | 'DEVUELTO A TIENDA'
  | 'Devolucion' // variant of Devolución
  | 'CANCELADO' // variant of Cancelado
  // from old types that might still be used
  | 'Pendiente'
  | 'En almacén'
  | 'En tránsito'
  | 'Nuevo';


export interface Order {
  id: string;
  externalOrderReference?: string;
  client: string;
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  cashOnDeliveryAmount?: number;
  createdAt: string; // ISO string or parsable format
  estadoDeEmpaque?: 'Pendiente' | 'Empacado' | 'Enviado';
  ubicacionDeAlmacen?: string;
  assignedCourier?: string;
  assignedCourierName?: string;
  collectedFromCourier?: boolean;
  deliveredAt?: string; // ISO string
  deliveryAddress: {
    id: string;
    city: string;
    sector: string;
    province: string;
    addressLine1: string;
    reference?: string;
    googleMapsUrl?: string;
  };
  paymentType?: 'COD' | 'Online';
}
