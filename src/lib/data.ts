import type { User, Order, UserRole, OrderComment, OrderEvent, ProductLineItem } from './types';

export const mockUsers: Record<UserRole, User> = {
  admin: {
    name: 'Igor Rodriguez',
    email: 'admin@khlothia.pack',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/admin/100/100'
  },
  operations: {
    name: 'Ana de Operaciones',
    email: 'ops@khlothia.pack',
    role: 'operations',
    avatarUrl: 'https://picsum.photos/seed/ops/100/100'
  },
  client: {
    name: 'Tienda Moda',
    email: 'client@khlothia.pack',
    role: 'client',
    avatarUrl: 'https://picsum.photos/seed/client/100/100'
  },
  courier: {
    name: 'Pedro Mensajero',
    email: 'courier@khlothia.pack',
    role: 'courier',
    avatarUrl: 'https://picsum.photos/seed/courier/100/100'
  },
  finance: {
    name: 'Carlos de Finanzas',
    email: 'finance@khlothia.pack',
    role: 'finance',
    avatarUrl: 'https://picsum.photos/seed/finance/100/100'
  },
  warehouse: {
    name: 'Maria de Almacén',
    email: 'warehouse@khlothia.pack',
    role: 'warehouse',
    avatarUrl: 'https://picsum.photos/seed/warehouse/100/100'
  }
};

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
    { id: 'prod1', name: 'Magnesio Complex 60 caps', sku: 'SKU-MAG001', quantity: 2, declaredValue: 1200 },
    { id: 'prod2', name: 'Vitamina D3', sku: 'SKU-VD3002', quantity: 1, declaredValue: 800 },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    externalOrderReference: 'POD0001',
    client: 'Tienda Moda',
    status: 'Generado',
    recipientName: 'Ana García',
    recipientPhone: '809-111-2222',
    createdAt: '2024-07-22T10:00:00Z',
    estadoDeEmpaque: 'Pendiente',
    paymentType: 'COD',
    deliveryAddress: { id: 'addr1', city: 'Santo Domingo', sector: 'Naco', province: 'DN', addressLine1: 'Calle Fantasía 123' },
    location: 'Recepción',
    subLocation: 'P1',
    comments: mockComments,
    history: mockHistory,
    serviceType: 'Logística 360°',
    products: mockProducts,
    financials: { codAmount: 2500, collectedFromCourier: false, freightCost: 300, fulfillmentCost: 60, serviceFee: 16, totalCost: 376, netToLiquidate: 2124 },
    cashOnDeliveryAmount: 2500,
  },
  {
    id: '2',
    externalOrderReference: 'POD0002',
    client: 'ElectroHogar',
    status: 'Confirmado',
    recipientName: 'Luis Jiménez',
    recipientPhone: '829-333-4444',
    createdAt: '2024-07-22T11:30:00Z',
    estadoDeEmpaque: 'Empacado',
    paymentType: 'COD',
    deliveryAddress: { id: 'addr2', city: 'Santiago', sector: 'El Dorado', province: 'Santiago', addressLine1: 'Av. Estrella Sadhalá 45' },
    location: 'Alistamiento',
    subLocation: 'Q2',
    comments: [],
    history: [],
    serviceType: 'Logística 180°',
    products: [{ id: 'prod3', name: 'Smart TV 55"', sku: 'TV-LG-55', quantity: 1, declaredValue: 15000 }],
    pickupAddress: { id: 'pick1', name: 'Almacén ElectroHogar', city: 'Santiago', sector: 'Zona Industrial', province: 'Santiago', addressLine1: 'Calle Industrial 1' },
    financials: { codAmount: 15000, collectedFromCourier: false, freightCost: 500, fulfillmentCost: 0, serviceFee: 16, totalCost: 516, netToLiquidate: 14484 },
    cashOnDeliveryAmount: 15000,
  },
  {
    id: '3',
    externalOrderReference: 'POD0003',
    client: 'Libros & Café',
    status: 'En Ruta',
    recipientName: 'Carla Fernández',
    recipientPhone: '849-555-6666',
    createdAt: '2024-07-21T15:00:00Z',
    estadoDeEmpaque: 'Enviado',
    assignedCourierName: 'Pedro Martinez',
    paymentType: 'COD',
    deliveryAddress: { id: 'addr3', city: 'Santo Domingo', sector: 'Mirador Sur', province: 'DN', addressLine1: 'Av. Anacaona 78' },
    location: 'En Ruta',
    serviceType: 'Fulfillment',
    products: [{ id: 'prod4', name: 'Libro "Cien Años de Soledad"', sku: 'LIB-GGM-01', quantity: 1, declaredValue: 850 }],
    thirdPartyCourier: 'Chintra.com',
    financials: { codAmount: 850, collectedFromCourier: false, freightCost: 0, fulfillmentCost: 60, serviceFee: 16, totalCost: 76, netToLiquidate: 774 },
    cashOnDeliveryAmount: 850,
  },
  {
    id: '4',
    externalOrderReference: 'POD0004',
    client: 'Tienda Moda',
    status: 'Entregado',
    recipientName: 'Sofía Reyes',
    recipientPhone: '809-777-8888',
    createdAt: '2024-07-20T09:00:00Z',
    deliveredAt: '2024-07-20T14:30:00Z',
    estadoDeEmpaque: 'Enviado',
    assignedCourierName: 'Juan Castillo',
    paymentType: 'COD',
    deliveryAddress: { id: 'addr4', city: 'Punta Cana', sector: 'Bávaro', province: 'La Altagracia', addressLine1: 'Residencial Palma Real, Villa 15' },
    location: 'En Ruta',
    serviceType: 'Logística 360°',
    products: [{ id: 'prod5', name: 'Vestido de Verano', sku: 'VES-SUM-05', quantity: 1, declaredValue: 3200 }],
    financials: { codAmount: 3200, collectedFromCourier: true, freightCost: 350, fulfillmentCost: 60, serviceFee: 16, totalCost: 426, netToLiquidate: 2774 },
     cashOnDeliveryAmount: 3200,
  },
  {
    id: '5',
    externalOrderReference: 'POD0005',
    client: 'Juguetería Feliz',
    status: 'Novedad',
    recipientName: 'Mario Vargas',
    recipientPhone: '829-999-0000',
    createdAt: '2024-07-21T12:00:00Z',
    estadoDeEmpaque: 'Enviado',
    assignedCourierName: 'Pedro Martinez',
    paymentType: 'COD',
    deliveryAddress: { id: 'addr5', city: 'Santo Domingo', sector: 'Gazcue', province: 'DN', addressLine1: 'Calle Moises Garcia 10' },
    location: 'En Ruta',
    serviceType: 'Logística 360°',
    products: [{ id: 'prod6', name: 'Carro a Control Remoto', sku: 'JUG-CAR-01', quantity: 1, declaredValue: 1200 }],
    history: [
        {
          id: 'hist-novedad-5',
          eventType: 'Status Change',
          user: { name: 'Pedro Martinez' },
          createdAt: '2024-07-21T14:00:00Z',
          from: 'En Ruta',
          to: 'Novedad',
          comment: 'Dirección no encontrada. El número del edificio no existe en la calle.',
          photoUrl: 'https://picsum.photos/seed/novedad-5/600/400'
        }
      ],
    financials: { codAmount: 1200, collectedFromCourier: false, freightCost: 300, fulfillmentCost: 60, serviceFee: 16, totalCost: 376, netToLiquidate: 824 },
    cashOnDeliveryAmount: 1200,
  },
];
