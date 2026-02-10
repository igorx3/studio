'use client';

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Download, FileDown, List, Kanban } from "lucide-react";
import { mockOrders } from "@/lib/data";
import type { Order, OrderStatus } from "@/lib/types";
import { OrdersList } from './OrdersList';
import { OrdersKanban } from './OrdersKanban';

const submenuItems: { label: string, statusFilter: OrderStatus[] | null }[] = [
    { label: 'Nuevos', statusFilter: ['Generado', 'Nuevo'] },
    { label: 'Confirmados', statusFilter: ['Confirmado', 'Confirmado para la tarde'] },
    { label: 'Novedad', statusFilter: ['Novedad', 'NOVEDAD 2'] },
    { label: 'Pendientes', statusFilter: ['Pendiente Respuesta', 'Llamar', 'Pendiente'] },
    { label: 'Todos', statusFilter: null },
];

export function OrdersModule() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('Todos');
  
  const orders = useMemo(() => mockOrders, []);

  const filteredOrders = useMemo(() => {
    const activeFilter = submenuItems.find(item => item.label === activeSubMenu);
    if (!activeFilter || !activeFilter.statusFilter) {
      return orders;
    }
    return orders.filter(order => activeFilter.statusFilter!.includes(order.status));
  }, [orders, activeSubMenu]);

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
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    <Plus className="mr-2 h-4 w-4"/>
                    Nuevo Pedido
                </Button>
            </div>
        </div>

        <Tabs defaultValue="list" value={view} onValueChange={(v) => setView(v as 'list' | 'kanban')} className="w-full">
            <div className="flex justify-between items-center">
                <TabsList className="bg-muted text-muted-foreground">
                    {submenuItems.map(item => (
                        <TabsTrigger 
                            key={item.label} 
                            value={item.label}
                            className={`data-[state=active]:bg-background data-[state=active]:text-foreground ${activeSubMenu === item.label ? 'bg-background text-foreground' : ''}`}
                            onClick={() => setActiveSubMenu(item.label)}
                        >
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsList>
                    <TabsTrigger value="list"><List className="h-4 w-4"/></TabsTrigger>
                    <TabsTrigger value="kanban"><Kanban className="h-4 w-4" /></TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="list" className="mt-4">
                <OrdersList orders={filteredOrders} />
            </TabsContent>
            <TabsContent value="kanban" className="mt-4">
                <OrdersKanban orders={filteredOrders} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
