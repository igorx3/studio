'use client';
import React, { useMemo } from 'react';
import type { InventoryItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Archive, AlertTriangle, Clock, Sigma, Ban } from "lucide-react";
import { Timestamp } from 'firebase/firestore';

interface InventoryDashboardProps {
  items: InventoryItem[];
}

export function InventoryDashboard({ items }: InventoryDashboardProps) {

  const kpis = useMemo(() => {
    if (!items || items.length === 0) {
        return {
            totalValue: 0,
            totalSkus: 0,
            totalUnits: 0,
            lowStockItems: 0,
            criticalStockItems: 0,
            outOfStockItems: 0,
            expiringSoonItems: 0,
        };
    }

    const totalValue = items.reduce((sum, item) => sum + (item.declaredValue * item.stockTotal), 0);
    const totalSkus = items.length;
    const totalUnits = items.reduce((sum, item) => sum + item.stockTotal, 0);
    
    const lowStockItems = items.filter(item => item.stockAvailable < item.idealStock && item.stockAvailable > item.minStock).length;
    const criticalStockItems = items.filter(item => item.stockAvailable <= item.minStock && item.stockAvailable > 0).length;
    const outOfStockItems = items.filter(item => item.stockAvailable === 0).length;
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoonItems = items.filter(item => {
        if (!item.expirationDate) return false;
        let expiration;
        if (item.expirationDate instanceof Timestamp) {
            expiration = item.expirationDate.toDate();
        } else if (typeof item.expirationDate === 'string') {
            expiration = new Date(item.expirationDate);
        } else {
            return false;
        }
        return expiration <= thirtyDaysFromNow;
    }).length;

    return {
      totalValue,
      totalSkus,
      totalUnits,
      lowStockItems,
      criticalStockItems,
      outOfStockItems,
      expiringSoonItems,
    };
  }, [items]);

  const kpiCards = [
    { title: "Valor Total del Inventario", value: `$${kpis.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Sigma },
    { title: "Total de Artículos (SKUs)", value: kpis.totalSkus.toLocaleString(), icon: Package },
    { title: "Total de Unidades", value: kpis.totalUnits.toLocaleString(), icon: Archive },
    { title: "Artículos con Stock Bajo", value: kpis.lowStockItems.toLocaleString(), icon: AlertTriangle, color: "text-yellow-500" },
    { title: "Artículos con Stock Crítico", value: kpis.criticalStockItems.toLocaleString(), icon: AlertTriangle, color: "text-orange-500" },
    { title: "Artículos Agotados", value: kpis.outOfStockItems.toLocaleString(), icon: Ban, color: "text-red-500" },
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
