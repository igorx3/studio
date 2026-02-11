'use client';
import React, { useMemo } from 'react';
import type { InventoryItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Archive, AlertTriangle, Clock, Sigma } from "lucide-react";

interface InventoryDashboardProps {
  items: InventoryItem[];
}

export function InventoryDashboard({ items }: InventoryDashboardProps) {

  const kpis = useMemo(() => {
    const totalValue = items.reduce((sum, item) => sum + (item.declaredValue * item.stockTotal), 0);
    const totalSkus = items.length;
    const totalUnits = items.reduce((sum, item) => sum + item.stockTotal, 0);
    const lowStockItems = items.filter(item => item.stockAvailable > 0 && item.stockAvailable <= item.minStock).length;
    const outOfStockItems = items.filter(item => item.stockAvailable === 0).length;
    
    // TODO: Implement "Nearing Expiration" logic
    const expiringSoonItems = 0; 
    // const thirtyDaysFromNow = new Date();
    // thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    // const expiringSoonItems = items.filter(item => 
    //   item.expirationDate && new Date(item.expirationDate.seconds * 1000) <= thirtyDaysFromNow
    // ).length;

    return {
      totalValue,
      totalSkus,
      totalUnits,
      lowStockItems,
      outOfStockItems,
      expiringSoonItems,
    };
  }, [items]);

  const kpiCards = [
    { title: "Valor Total del Inventario", value: `$${kpis.totalValue.toLocaleString()}`, icon: Sigma },
    { title: "Total de Artículos (SKUs)", value: kpis.totalSkus.toLocaleString(), icon: Package },
    { title: "Total de Unidades", value: kpis.totalUnits.toLocaleString(), icon: Archive },
    { title: "Artículos con Stock Bajo", value: kpis.lowStockItems.toLocaleString(), icon: AlertTriangle, color: "text-primary" },
    { title: "Artículos Agotados", value: kpis.outOfStockItems.toLocaleString(), icon: AlertTriangle, color: "text-destructive" },
    { title: "Próximos a Vencer", value: kpis.expiringSoonItems.toLocaleString(), icon: Clock, color: "text-orange-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {kpiCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 text-muted-foreground ${card.color || ''}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
