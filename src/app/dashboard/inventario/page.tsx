'use client';

import { useState, useMemo } from 'react';
import { useAuth } from "@/context/auth-context";
import React from 'react';

import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Settings2, Loader2 } from "lucide-react";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { ArticlesView } from "@/components/inventory/ArticlesView";
import { MovementsView } from "@/components/inventory/MovementsView";
import { AdjustmentsView } from "@/components/inventory/AdjustmentsView";
import type { InventoryItem, Store } from '@/lib/types';
import { mockInventoryItems, mockStores } from '@/lib/data';


export default function InventarioPage() {
  const { user } = useAuth();
  
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [isLoading, setIsLoading] = useState(false);

  const isClient = user?.role === 'client';

  const clientItems = useMemo(() => {
    if (isClient && user?.storeId) {
      return items.filter(item => item.storeId === user.storeId);
    }
    return items;
  }, [items, isClient, user?.storeId]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Gestión de Inventario</h1>
              <p className="text-muted-foreground">
                Administra los productos de tus tiendas almacenados en tu centro.
              </p>
          </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => <Card key={i}><CardHeader className="h-24"></CardHeader></Card>)}
        </div>
      ) : (
        <InventoryDashboard items={clientItems} />
      )}
      
      <Tabs defaultValue="articles" className="w-full">
        <TabsList>
          <TabsTrigger value="articles"><Package className="mr-2 h-4 w-4" /> Artículos</TabsTrigger>
          <TabsTrigger value="movements"><Truck className="mr-2 h-4 w-4" /> Movimientos</TabsTrigger>
          {!isClient && <TabsTrigger value="adjustments"><Settings2 className="mr-2 h-4 w-4" /> Entradas, Salidas y Ajustes</TabsTrigger>}
        </TabsList>
        {isLoading ? (
            <div className="flex items-center justify-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <>
                <TabsContent value="articles" className="mt-4">
                <ArticlesView items={clientItems} stores={stores} />
                </TabsContent>
                <TabsContent value="movements" className="mt-4">
                <MovementsView />
                </TabsContent>
                <TabsContent value="adjustments" className="mt-4">
                <AdjustmentsView />
                </TabsContent>
            </>
        )}
      </Tabs>
    </div>
  );
}
