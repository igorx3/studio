'use client';

import React from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface OrdersKanbanProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

type KanbanColumn = {
  id: string;
  label: string;
  statuses: OrderStatus[];
};

const columns: KanbanColumn[] = [
    { id: 'Generado', label: 'Creados', statuses: ['Generado'] },
    { id: 'Enviado', label: 'En Almacén', statuses: ['Enviado', 'ENVIADO'] },
    { id: 'Confirmado', label: 'Listos', statuses: ['Confirmado', 'Confirmado para la tarde', 'Coordinado', 'CONFIRMADO SIN STOCK'] },
    { id: 'En Ruta', label: 'En Ruta', statuses: ['En Ruta'] },
    { id: 'Entregado', label: 'Entregados', statuses: ['Entregado', 'ENTREGADO'] },
    { id: 'Novedad', label: 'Fallidos', statuses: ['Novedad', 'NOVEDAD 2', 'Pendiente Respuesta', 'Sin respuestas', 'NO RECOGIDO', 'Llamar', 'Reprogramado', 'No Contesta', 'Sin Cobertura'] },
    { id: 'Devolucion', label: 'Devueltos', statuses: ['Devolución', 'DEVUELTO A TIENDA', 'Devolucion', 'Indemnización'] },
    { id: 'Cancelado', label: 'Cancelados', statuses: ['Cancelado', 'Anulado', 'CANCELADO'] },
];

const OrderCard = ({ order, onClick }: { order: Order, onClick: () => void }) => {
  return (
    <Card className="mb-2 cursor-pointer hover:bg-muted/80" onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
            <p className="font-semibold text-sm">{order.externalOrderReference || order.id}</p>
            <Badge variant="outline">{order.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{order.client}</p>
        <p className="text-sm mt-1">{order.recipientName}</p>
        <p className="text-xs text-muted-foreground">{order.deliveryAddress.addressLine1}</p>
        <div className="flex justify-between items-end mt-2">
            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
            {order.cashOnDeliveryAmount && <p className="font-bold text-sm">${order.cashOnDeliveryAmount.toLocaleString()}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export function OrdersKanban({ orders, onOrderClick }: OrdersKanbanProps) {
  const getColumnOrders = (statuses: OrderStatus[]) => {
    return orders.filter(order => statuses.includes(order.status));
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-1 pb-4">
        {columns.map(column => {
            const columnOrders = getColumnOrders(column.statuses);
            return (
            <div key={column.id} className="w-80 flex-shrink-0">
                <Card className="bg-muted/50">
                    <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-semibold">{column.label}</CardTitle>
                            <Badge variant="secondary">{columnOrders.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2 h-[calc(100vh-20rem)] overflow-y-auto">
                        {columnOrders.length > 0 ? (
                            columnOrders.map(order => <OrderCard key={order.id} order={order} onClick={() => onOrderClick(order)} />)
                        ) : (
                            <p className="text-xs text-center text-muted-foreground p-4">No hay pedidos en este estado.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            );
        })}
        </div>
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
