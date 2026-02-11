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

export type Location = 'Alistamiento' | 'Despacho' | 'Recepción' | 'En Ruta' | 'Almacén';
export type SubLocation = 'Q1' | 'Q2' | 'K1' | 'K2' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10' | 'P11' | 'P12';

export interface Order {
  id: string;
  externalOrderReference?: string;
  client: string; // The store
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  cashOnDeliveryAmount?: number;
  createdAt: string; // ISO string or parsable format
  estadoDeEmpaque?: 'Pendiente' | 'Empacado' | 'Enviado';
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
  location?: Location;
  subLocation?: SubLocation;
  comments?: OrderComment[];
  history?: OrderEvent[];
}

export interface OrderComment {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  text: string;
  photos?: string[];
}

export type OrderEventType = 'Status Change' | 'Location Change';

export interface OrderEvent {
  id: string;
  eventType: OrderEventType;
  user: {
    name: string;
  };
  createdAt: string;
  from?: string;
  to?: string;
  comment?: string;
  subLocation?: SubLocation;
}
