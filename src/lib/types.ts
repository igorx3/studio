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
  | 'Pendiente Respuesta'
  | 'Novedad'
  | 'Entregado'
  | 'En Ruta'
  | 'Enviado'
  | 'Cancelado'
  | 'Devolución'
  | 'No Contesta'
  | 'Sin Cobertura'
  | 'Indemnización'
  | 'Anulado'
  // Legacy/variant statuses from Kanban definition
  | 'ENVIADO' 
  | 'CONFIRMADO SIN STOCK'
  | 'ENTREGADO' 
  | 'NOVEDAD 2'
  | 'Sin respuestas'
  | 'NO RECOGIDO'
  | 'DEVUELTO A TIENDA'
  | 'Devolucion' 
  | 'CANCELADO'
  // from old types that might still be used
  | 'Pendiente'
  | 'En almacén'
  | 'En tránsito'
  | 'Nuevo'
  | 'Coordinado'
  | 'Llamar'
  | 'Reprogramado';

export type ServiceType = 'Logística 360°' | 'Logística 180°' | 'Fulfillment';
export type ThirdPartyCourier = 'Chintra.com' | 'Aurelpack';
export type Location = 'Alistamiento' | 'Despacho' | 'Recepción' | 'En Ruta' | 'Almacén';
export type SubLocation = 'Q1' | 'Q2' | 'K1' | 'K2' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10' | 'P11' | 'P12';

export interface Address {
    id: string;
    city: string;
    sector: string;
    province: string;
    addressLine1: string;
    reference?: string;
    googleMapsUrl?: string;
    name?: string;
}

export interface ProductLineItem {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    declaredValue: number;
}

export interface OrderFinancials {
    codAmount: number;
    collectedFromCourier: boolean;
    freightCost: number;
    fulfillmentCost: number;
    serviceFee: number;
    totalCost: number;
    netToLiquidate: number;
}

export interface Order {
  id: string;
  externalOrderReference?: string;
  client: string; 
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  createdAt: string; 
  estadoDeEmpaque?: 'Pendiente' | 'Empacado' | 'Enviado';
  assignedCourier?: string;
  assignedCourierName?: string;
  deliveredAt?: string; 
  deliveryAddress: Address;
  paymentType?: 'COD' | 'Online';
  location?: Location;
  subLocation?: SubLocation;
  comments?: OrderComment[];
  history?: OrderEvent[];
  // New fields from Part 2
  serviceType: ServiceType;
  products: ProductLineItem[];
  financials: OrderFinancials;
  pickupAddress?: Address;
  thirdPartyCourier?: ThirdPartyCourier;
  // Legacy fields
  cashOnDeliveryAmount?: number;
  collectedFromCourier?: boolean;
}

export interface OrderComment {
  id: string;
  user: {
    name:string;
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
  photoUrl?: string; // For novelty evidence
  subLocation?: SubLocation;
}

export interface Store {
    id: string;
    name: string;
    freightCost: number;
    fulfillmentCost: number;
    serviceFee: number;
    // Factor de no efectivo
    nonDeliveryFactors: {
        devolution: {
            freight: number; // 0.5 for 50%
            fulfillment: number;
            serviceFee: number;
        },
        cancellation: {
            freight: number;
            fulfillment: number;
            serviceFee: number;
        }
    }
}

// From Part 5
export type InventoryItemStatus = 'Activo' | 'Inactivo' | 'Agotado';

export interface InventoryItem {
  id: string;
  photoUrl: string;
  name: string;
  sku: string;
  barcode?: string;
  storeName: string;
  category: string;
  stockAvailable: number;
  stockReserved: number;
  stockTotal: number;
  declaredValue: number;
  location: SubLocation;
  weight: number; // in grams
  dimensions: {
    length: number; // in cm
    width: number;
    height: number;
  };
  expirationDate?: string;
  status: InventoryItemStatus;
  createdAt: string;
  reorderPoint: number;
}

export type InventoryMovementType = 
  | 'Entrada de Mercancía'
  | 'Reserva por Pedido'
  | 'Liberación de Reserva'
  | 'Salida por Despacho'
  | 'Entrada por Devolución'
  | 'Ajuste Manual (+)'
  | 'Ajuste Manual (-)'
  | 'Salida por Merma';

export interface InventoryMovement {
  id: string;
  timestamp: string;
  productName: string;
  productSku: string;
  storeName: string;
  type: InventoryMovementType;
  reference?: string; // Order tracking ID or adjustment ID
  quantityChange: number; // +N for entry, -N for exit
  stockBefore: number;
  stockAfter: number;
  user: string; // User who performed the action
  notes?: string;
}
