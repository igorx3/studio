import type { User, Order, UserRole, OrderComment, OrderEvent, ProductLineItem, InventoryItem, Store } from './types';
import { Timestamp } from 'firebase/firestore';

export const mockUsers: Record<UserRole, User> = {
  admin: {
    uid: 'admin-user-id',
    name: 'Igor Rodriguez',
    email: 'admin@khlothia.pack',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/admin/100/100'
  },
  operations: {
    uid: 'operations-user-id',
    name: 'Ana de Operaciones',
    email: 'ops@khlothia.pack',
    role: 'operations',
    avatarUrl: 'https://picsum.photos/seed/ops/100/100'
  },
  client: {
    uid: 'client-user-id',
    name: 'Tienda Moda',
    email: 'client@khlothia.pack',
    role: 'client',
    avatarUrl: 'https://picsum.photos/seed/client/100/100',
    storeId: 'store1'
  },
  courier: {
    uid: 'courier-user-id',
    name: 'Pedro Mensajero',
    email: 'courier@khlothia.pack',
    role: 'courier',
    avatarUrl: 'https://picsum.photos/seed/courier/100/100'
  },
  finance: {
    uid: 'finance-user-id',
    name: 'Carlos de Finanzas',
    email: 'finance@khlothia.pack',
    role: 'finance',
    avatarUrl: 'https://picsum.photos/seed/finance/100/100'
  },
  warehouse: {
    uid: 'warehouse-user-id',
    name: 'Maria de Almacén',
    email: 'warehouse@khlothia.pack',
    role: 'warehouse',
    avatarUrl: 'https://picsum.photos/seed/warehouse/100/100'
  }
};

export const mockStores: Store[] = [
    {
        id: 'store1',
        name: 'Tienda Moda',
        contactName: 'Ana',
        email: 'ventas@tiendamoda.com',
        phone: '809-111-2222',
        address: 'Av. Sol 123',
        logo: 'https://picsum.photos/seed/store1/100/100',
        rates: { freight: 300, fulfillment: 60, serviceFee: 16 },
        nonEffectiveFactor: { return: { freightPercent: 50, fulfillmentPercent: 50, serviceFeePercent: 100 }, cancelled: { freightPercent: 0, fulfillmentPercent: 50, serviceFeePercent: 100 } },
        status: 'active',
        createdAt: Timestamp.fromDate(new Date('2024-01-01T10:00:00Z')),
        updatedAt: Timestamp.fromDate(new Date('2024-01-01T10:00:00Z')),
    },
    {
        id: 'store2',
        name: 'ElectroHogar',
        contactName: 'Luis',
        email: 'ventas@electrohogar.com',
        phone: '809-333-4444',
        address: 'Calle Luna 456',
        logo: 'https://picsum.photos/seed/store2/100/100',
        rates: { freight: 350, fulfillment: 80, serviceFee: 20 },
        nonEffectiveFactor: { return: { freightPercent: 50, fulfillmentPercent: 50, serviceFeePercent: 100 }, cancelled: { freightPercent: 0, fulfillmentPercent: 50, serviceFeePercent: 100 } },
        status: 'active',
        createdAt: Timestamp.fromDate(new Date('2024-02-01T10:00:00Z')),
        updatedAt: Timestamp.fromDate(new Date('2024-02-01T10:00:00Z')),
    },
     {
        id: 'store3',
        name: 'Libros & Café',
        contactName: 'Carla',
        email: 'ventas@libroscafe.com',
        phone: '809-555-6666',
        address: 'Plaza Cultura',
        logo: 'https://picsum.photos/seed/store3/100/100',
        rates: { freight: 250, fulfillment: 50, serviceFee: 15 },
        nonEffectiveFactor: { return: { freightPercent: 50, fulfillmentPercent: 50, serviceFeePercent: 100 }, cancelled: { freightPercent: 0, fulfillmentPercent: 50, serviceFeePercent: 100 } },
        status: 'active',
        createdAt: Timestamp.fromDate(new Date('2024-03-01T10:00:00Z')),
        updatedAt: Timestamp.fromDate(new Date('2024-03-01T10:00:00Z')),
    },
];

const mockComments: OrderComment[] = [
    {
        id: 'comment1',
        user: { name: 'Ana de Operaciones', avatarUrl: mockUsers.operations.avatarUrl },
        createdAt: '2024-07-22T10:05:00Z',
        text: 'Se contactó al cliente para confirmar dirección. Todo correcto.',
    },
    {
        id: 'comment2',
        user: { name: 'Tienda Moda' },
        createdAt: '2024-07-22T10:10:00Z',
        text: '¡Gracias por confirmar! Por favor proceder.',
    }
];

const mockHistory: OrderEvent[] = [
    {
        id: 'hist1',
        eventType: 'Status Change',
        user: { name: 'Sistema' },
        createdAt: '2024-07-22T10:00:00Z',
        from: 'Nuevo',
        to: 'Generado'
    },
    {
        id: 'hist2',
        eventType: 'Location Change',
        user: { name: 'Maria de Almacén' },
        createdAt: '2024-07-22T11:00:00Z',
        from: 'Recepción',
        to: 'Alistamiento',
        subLocation: 'Q1'
    },
     {
        id: 'hist3',
        eventType: 'Status Change',
        user: { name: 'Ana de Operaciones' },
        createdAt: '2024-07-22T11:30:00Z',
        from: 'Generado',
        to: 'Confirmado'
    },
];

const mockProducts: ProductLineItem[] = [
    { itemId: 'inv1', name: 'Magnesio Complex 60 caps', sku: 'SKU-MAG001', quantity: 2, price: 1200 },
    { itemId: 'inv2', name: 'Vitamina D3', sku: 'SKU-VD3002', quantity: 1, price: 800 },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    trackingId: 'POD0001',
    storeId: 'store1',
    storeName: 'Tienda Moda',
    serviceType: 'logistics_360',
    status: 'Generado',
    recipient: { name: 'Ana García', phone: '809-111-2222', city: 'Santo Domingo', sector: 'Naco', address: 'Calle Fantasía 123' },
    recipientId: '809-111-2222',
    products: mockProducts,
    costs: { freight: 300, fulfillment: 60, serviceFee: 16, total: 376, netToStore: 2124 },
    warehouse: { packingStatus: 'pending' },
    isDraft: false,
    createdBy: 'client-user-id',
    createdAt: '2024-07-22T10:00:00Z',
    updatedAt: '2024-07-22T10:00:00Z',
    paymentType: 'cod',
    codAmount: 2500,
    collectedFromCourier: false,
    
    // legacy
    externalOrderReference: 'POD0001',
    client: 'Tienda Moda',
    recipientName: 'Ana García',
    recipientPhone: '809-111-2222',
    estadoDeEmpaque: 'Pendiente',
    deliveryAddress: { id: 'addr1', city: 'Santo Domingo', sector: 'Naco', province: 'DN', addressLine1: 'Calle Fantasía 123' },
    location: 'Recepción',
    comments: mockComments,
    history: mockHistory,
    financials: { codAmount: 2500, collectedFromCourier: false, freightCost: 300, fulfillmentCost: 60, serviceFee: 16, totalCost: 376, netToLiquidate: 2124 },
    cashOnDeliveryAmount: 2500,
  },
  {
    id: '2',
    trackingId: 'POD0002',
    storeId: 'store2',
    storeName: 'ElectroHogar',
    serviceType: 'logistics_180',
    status: 'Confirmado',
    recipient: { name: 'Luis Jiménez', phone: '829-333-4444', city: 'Santiago', sector: 'El Dorado', address: 'Av. Estrella Sadhalá 45' },
    recipientId: '829-333-4444',
    products: [{ itemId: 'inv3', name: 'Smart TV 55"', sku: 'TV-LG-55', quantity: 1, price: 15000 }],
    costs: { freight: 500, fulfillment: 0, serviceFee: 16, total: 516, netToStore: 14484 },
    pickupAddress: { name: 'Almacén ElectroHogar', address: 'Calle Industrial 1' },
    warehouse: { packingStatus: 'packed' },
    isDraft: false,
    createdBy: 'ops-user-id',
    createdAt: '2024-07-22T11:30:00Z',
    updatedAt: '2024-07-22T11:30:00Z',
    paymentType: 'cod',
    codAmount: 15000,
    collectedFromCourier: false,

    // legacy
    externalOrderReference: 'POD0002',
    client: 'ElectroHogar',
    recipientName: 'Luis Jiménez',
    recipientPhone: '829-333-4444',
    estadoDeEmpaque: 'Empacado',
    deliveryAddress: { id: 'addr2', city: 'Santiago', sector: 'El Dorado', province: 'Santiago', addressLine1: 'Av. Estrella Sadhalá 45' },
    location: 'Alistamiento',
    comments: [],
    history: [],
    financials: { codAmount: 15000, collectedFromCourier: false, freightCost: 500, fulfillmentCost: 0, serviceFee: 16, totalCost: 516, netToLiquidate: 14484 },
    cashOnDeliveryAmount: 15000,
  },
  {
    id: '3',
    trackingId: 'POD0003',
    storeId: 'store3',
    storeName: 'Libros & Café',
    serviceType: 'fulfillment',
    status: 'En Ruta',
    recipient: { name: 'Carla Fernández', phone: '849-555-6666', city: 'Santo Domingo', sector: 'Mirador Sur', address: 'Av. Anacaona 78' },
    recipientId: '849-555-6666',
    products: [{ itemId: 'inv4', name: 'Libro "Cien Años de Soledad"', sku: 'LIB-GGM-01', quantity: 1, price: 850 }],
    costs: { freight: 0, fulfillment: 60, serviceFee: 16, total: 76, netToStore: 774 },
    thirdPartyCarrier: 'chintra',
    courier: { id: 'chintra-id', name: 'Chintra' },
    warehouse: { packingStatus: 'dispatched' },
    isDraft: false,
    createdBy: 'client-user-id-3',
    createdAt: '2024-07-21T15:00:00Z',
    updatedAt: '2024-07-21T15:00:00Z',
    paymentType: 'cod',
    codAmount: 850,
    collectedFromCourier: false,

    // legacy
    externalOrderReference: 'POD0003',
    client: 'Libros & Café',
    recipientName: 'Carla Fernández',
    recipientPhone: '849-555-6666',
    estadoDeEmpaque: 'Enviado',
    assignedCourierName: 'Pedro Martinez',
    deliveryAddress: { id: 'addr3', city: 'Santo Domingo', sector: 'Mirador Sur', province: 'DN', addressLine1: 'Av. Anacaona 78' },
    location: 'En Ruta',
    financials: { codAmount: 850, collectedFromCourier: false, freightCost: 0, fulfillmentCost: 60, serviceFee: 16, totalCost: 76, netToLiquidate: 774 },
    cashOnDeliveryAmount: 850,
  },
];
