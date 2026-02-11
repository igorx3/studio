import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'operations' | 'client' | 'courier' | 'finance' | 'warehouse';

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  avatarUrl: string | null;
  storeId?: string; // For client role
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

export type ServiceType = 'logistics_360' | 'logistics_180' | 'fulfillment';
export type ThirdPartyCourier = 'chintra' | 'aurelpack';
export type PackageLocation = 'alistamiento' | 'despacho' | 'recepcion' | 'en_ruta';
export type WarehouseSubLocation = 'Q1' | 'Q2' | 'K1' | 'K2' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10' | 'P11' | 'P12';

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
    itemId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
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

export interface OrderDropshippingInfo {
  originalCost: number;
  salePrice: number;
  minPrice: number;
  fee: number;
  feeType: 'fixed' | 'percentage';
  profit: number;
  storeProfit: number;
}

export interface Order {
  id: string;
  trackingId: string;
  storeId: string;
  storeName: string;
  serviceType: ServiceType;
  status: OrderStatus;
  previousStatus?: OrderStatus;
  paymentType: 'cod' | 'prepaid';
  codAmount: number;
  collectedFromCourier: boolean;
  recipient: {
    name: string;
    phone: string;
    city: string;
    sector: string;
    address: string;
  };
  recipientId: string; // Reference to clients collection
  products: ProductLineItem[];
  costs: {
    freight: number;
    fulfillment: number;
    serviceFee: number;
    total: number;
    netToStore: number;
  };
  courier?: {
    id: string;
    name: string;
  };
  pickupAddress?: {
    name: string;
    address: string;
  };
  thirdPartyCarrier?: ThirdPartyCourier;
  warehouse: {
    packingStatus: 'pending' | 'packed' | 'dispatched';
  };
  isDraft: boolean;
  draftTrackingId?: string;
  createdBy: string; // userId
  createdAt: any; // serverTimestamp
  updatedAt: any; // serverTimestamp

  isDropshipping?: boolean;
  dropshipping?: OrderDropshippingInfo;

  // Legacy fields for mock data compatibility
  externalOrderReference?: string;
  client?: string;
  recipientName?: string;
  recipientPhone?: string;
  estadoDeEmpaque?: string;
  assignedCourierName?: string;
  deliveredAt?: string;
  deliveryAddress?: Address;
  location?: string;
  subLocation?: string;
  comments?: OrderComment[];
  history?: OrderEvent[];
  financials?: OrderFinancials;
  cashOnDeliveryAmount?: number;
}

export interface OrderComment {
  id: string;
  orderId?: string;
  trackingId?: string;
  userId?: string;
  userName: string;
  userRole?: UserRole;
  comment?: string;
  photos?: string[];
  createdAt: any; // serverTimestamp
  text: string;
  user: { name: string, avatarUrl?: string };
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
  subLocation?: string;
}

export interface Store {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    logo: string;
    rates: {
      freight: number;
      fulfillment: number;
      serviceFee: number;
    };
    nonEffectiveFactor: {
      return: { freightPercent: number, fulfillmentPercent: number, serviceFeePercent: number },
      cancelled: { freightPercent: number, fulfillmentPercent: number, serviceFeePercent: number }
    };
    status: 'active' | 'inactive';
    createdAt: any; // serverTimestamp
    updatedAt: any; // serverTimestamp
}

export type InventoryItemStatus = 'active' | 'inactive' | 'depleted';

export interface DropshippingInfo {
  enabled: boolean;
  minPrice: number;
  suggestedPrice: number;
  fee: number;
  feeType: 'fixed' | 'percentage';
  description: string;
  photos: string[];
  category: string;
}

export interface InventoryItemPrivate {
  cost: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  storeId: string;
  storeName: string;
  category: string;
  description?: string;
  photos: string[];
  
  cost?: number; // Admin only, populated from private subcollection
  minSalePrice: number;
  normalPrice: number;

  initialStock: number;
  stockAvailable: number;
  stockReserved: number;
  stockTotal: number;
  minStock: number;
  idealStock: number;

  packageLocation?: PackageLocation;
  warehouseSubLocation?: WarehouseSubLocation;
  
  weight: number; // in grams
  dimensions: {
    length: number; // in cm
    width: number;
    height: number;
  };
  expirationDate?: any; // timestamp
  status: InventoryItemStatus;
  dropshipping?: DropshippingInfo;
  createdAt: any; // serverTimestamp
  updatedAt: any; // serverTimestamp
}

export type InventoryMovementType = 
  | 'order_reserve'
  | 'order_dispatch'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_returned'
  | 'manual_entry'
  | 'manual_exit'
  | 'adjustment'
  | 'shrinkage'
  | 'initial_stock';

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  storeId: string;
  storeName: string;
  movementType: InventoryMovementType;
  referenceId: string; // Order tracking ID or adjustment ID
  referenceType: 'order' | 'entry' | 'exit' | 'adjustment' | 'item_creation';
  quantity: number; // +N for entry, -N for exit
  stockBefore: number;
  stockAfter: number;
  userId: string;
  userName: string;
  notes?: string;
  createdAt: any; // serverTimestamp
}

export type InventoryTransactionType = 'entry' | 'exit' | 'adjustment';

export interface InventoryTransaction {
    id: string;
    type: InventoryTransactionType;
    storeId: string;
    storeName: string;
    items: {
        itemId: string,
        itemName: string,
        itemSku: string,
        quantity: number,
        warehouseLocation: string,
        condition: 'good' | 'damaged',
        notes: string
    }[];
    reason?: string;
    referenceNumber?: string;
    photos: string[];
    processedBy: string;
    processedByName: string;
    authorizedBy?: string;
    createdAt: any; // serverTimestamp
}

export interface Client {
    id: string; // phone number
    name: string;
    phone: string;
    addresses: { city: string, sector: string, address: string }[];
    totalOrders: number;
    deliveredCount: number;
    returnedCount: number;
    cancelledCount: number;
    noveltyCount: number;
    successRate: number;
    createdAt: any; // serverTimestamp
    updatedAt: any; // serverTimestamp
}

export interface ArticleCategory {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}
