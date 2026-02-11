import React from 'react';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';

interface OrderDetailsTabProps {
  order: Order;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || 'N/A'}</p>
    </div>
);

export default function OrderDetailsTab({ order }: OrderDetailsTabProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">Información del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <DetailItem label="Tracking ID" value={order.externalOrderReference} />
                <DetailItem label="Fecha de Creación" value={new Date(order.createdAt).toLocaleString()} />
                <DetailItem label="Tienda (Cliente)" value={order.client} />
                <DetailItem label="Estado" value={<Badge>{order.status}</Badge>} />
                <DetailItem label="Mensajero Asignado" value={order.assignedCourierName} />
                <DetailItem label="Tipo de Pago" value={order.paymentType} />
            </div>

            <Separator />
            
            <div>
                <h4 className="font-semibold mb-4">Destinatario</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <DetailItem label="Nombre" value={order.recipientName} />
                    <DetailItem label="Teléfono" value={order.recipientPhone} />
                    <DetailItem label="Ciudad" value={order.deliveryAddress.city} />
                    <DetailItem label="Sector" value={order.deliveryAddress.sector} />
                    <DetailItem label="Dirección" value={order.deliveryAddress.addressLine1} />
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="font-semibold mb-4">Financiero</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <DetailItem label="Monto COD" value={order.cashOnDeliveryAmount ? `$${order.cashOnDeliveryAmount.toLocaleString()}`: 'N/A'} />
                    <DetailItem label="Cobrado a Mensajero" value={order.collectedFromCourier ? 'Sí' : 'No'} />
                </div>
            </div>

             <Separator />

            <div>
                <h4 className="font-semibold mb-4">Almacén</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <DetailItem label="Estado de Empaque" value={order.estadoDeEmpaque} />
                    <DetailItem label="Ubicación Principal" value={order.location} />
                    <DetailItem label="Sub-Ubicación" value={order.subLocation} />
                </div>
            </div>
            
        </CardContent>
    </Card>
  );
}
