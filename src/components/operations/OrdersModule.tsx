'use client';

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Download, FileDown, List, Kanban } from "lucide-react";
import { mockOrders } from "@/lib/data";
import type { Order, OrderStatus } from "@/lib/types";
import { OrdersList } from './OrdersList';
import { OrdersKanban } from './OrdersKanban';
import OrderDetailDialog from './OrderDetailDialog';
import CreateOrderForm from './CreateOrderForm';

const submenuItems: { label: string; statusFilter: OrderStatus | OrderStatus[] | null }[] = [
    { label: 'Nuevos', statusFilter: 'Generado' },
    { label: 'Confirmados', statusFilter: 'Confirmado' },
    { label: 'Novedad', statusFilter: 'Novedad' },
    { label: 'Pendientes', statusFilter: ['Pendiente Respuesta', 'Llamar'] },
    { label: 'Todos', statusFilter: null },
];

export function OrdersModule() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('Todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const filteredOrders = useMemo(() => {
    const activeFilter = submenuItems.find(item => item.label === activeSubMenu);
    if (!activeFilter || !activeFilter.statusFilter) {
      return orders;
    }

    const filterValue = activeFilter.statusFilter;

    if (Array.isArray(filterValue)) {
      return orders.filter(order => filterValue.includes(order.status));
    }

    return orders.filter(order => order.status === filterValue);
  }, [orders, activeSubMenu]);

  const handleOrderCreated = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  const handleDuplicateOrder = (source: Order) => {
    setSelectedOrder(null);
    setDuplicateSource(source);
    setShowCreateForm(true);
  };

  return (
    <div className="flex flex-col h-full gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4"/>
                    Plantilla
                </Button>
                <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4"/>
                    Carga Masiva
                </Button>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4"/>
                    Exportar
                </Button>
                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                    onClick={() => setShowCreateForm(true)}
                >
                    <Plus className="mr-2 h-4 w-4"/>
                    Nuevo Pedido
                </Button>
            </div>
        </div>

        <Tabs defaultValue="list" value={view} onValueChange={(v) => setView(v as 'list' | 'kanban')} className="w-full">
            <div className="flex justify-between items-center">
                <Tabs value={activeSubMenu} onValueChange={setActiveSubMenu} defaultValue="Todos">
                    <TabsList className="bg-muted text-muted-foreground">
                        {submenuItems.map(item => (
                            <TabsTrigger
                                key={item.label}
                                value={item.label}
                                className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                            >
                                {item.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <TabsList>
                    <TabsTrigger value="list"><List className="h-4 w-4"/></TabsTrigger>
                    <TabsTrigger value="kanban"><Kanban className="h-4 w-4" /></TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="list" className="mt-4">
                <OrdersList orders={filteredOrders} onOrderClick={setSelectedOrder} />
            </TabsContent>
            <TabsContent value="kanban" className="mt-4">
                <OrdersKanban orders={filteredOrders} onOrderClick={setSelectedOrder} />
            </TabsContent>
        </Tabs>

        <OrderDetailDialog
            order={selectedOrder}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedOrder(null);
                }
            }}
            onOrderUpdate={handleOrderUpdate}
            onDuplicateOrder={handleDuplicateOrder}
        />

        <CreateOrderForm
            open={showCreateForm}
            onOpenChange={(open) => {
                setShowCreateForm(open);
                if (!open) setDuplicateSource(null);
            }}
            onOrderCreated={handleOrderCreated}
            initialData={duplicateSource}
        />
    </div>
  );
}
