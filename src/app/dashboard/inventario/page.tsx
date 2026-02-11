'use client';

import { useMemo } from 'react';
import { useAuth } from "@/context/auth-context";
import React from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Settings2, Loader2, Tags } from "lucide-react";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { ArticlesView } from "@/components/inventory/ArticlesView";
import { MovementsView } from "@/components/inventory/MovementsView";
import { AdjustmentsView } from "@/components/inventory/AdjustmentsView";
import { CategoriesView } from "@/components/inventory/categories/CategoriesView";
import type { InventoryItem, Store } from '@/lib/types';


export default function InventarioPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { isUserLoading: isAuthLoading } = useUser();
  
  const isAdmin = user?.role === 'admin' || user?.role === 'operations';

  const storesQuery = useMemoFirebase(() => {
      if (isAuthLoading || !firestore) return null;
      return query(collection(firestore, 'stores'));
  }, [firestore, isAuthLoading]);

  const itemsQuery = useMemoFirebase(() => {
    if (isAuthLoading || !firestore) return null;
    if (user?.role === 'client' && user.storeId) {
      return query(collection(firestore, 'inventory'), where('storeId', '==', user.storeId));
    }
    return query(collection(firestore, 'inventory'));
  }, [firestore, user?.role, user?.storeId, isAuthLoading]);

  const { data: storesData, isLoading: isLoadingStores } = useCollection<Store>(storesQuery);
  const { data: itemsData, isLoading: isLoadingItems } = useCollection<InventoryItem>(itemsQuery);

  const stores = useMemo(() => storesData || [], [storesData]);
  const items = useMemo(() => itemsData || [], [itemsData]);
  
  const isLoading = isAuthLoading || isLoadingStores || isLoadingItems;

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
            {[...Array(6)].map((_, i) => <Card key={i}><CardHeader className="h-24 animate-pulse bg-muted/50 rounded-lg"></CardHeader></Card>)}
        </div>
      ) : (
        <InventoryDashboard items={items} />
      )}
      
      <Tabs defaultValue="articles" className="w-full">
        <TabsList>
          <TabsTrigger value="articles"><Package className="mr-2 h-4 w-4" /> Artículos</TabsTrigger>
          <TabsTrigger value="movements"><Truck className="mr-2 h-4 w-4" /> Movimientos</TabsTrigger>
          {isAdmin && <TabsTrigger value="adjustments"><Settings2 className="mr-2 h-4 w-4" /> Entradas, Salidas y Ajustes</TabsTrigger>}
          {isAdmin && <TabsTrigger value="categories"><Tags className="mr-2 h-4 w-4" /> Categorías</TabsTrigger>}
        </TabsList>
        {isLoading ? (
            <div className="flex items-center justify-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <>
                <TabsContent value="articles" className="mt-4">
                <ArticlesView items={items} stores={stores} />
                </TabsContent>
                <TabsContent value="movements" className="mt-4">
                <MovementsView stores={stores} />
                </TabsContent>
                {isAdmin && (
                    <TabsContent value="adjustments" className="mt-4">
                    <AdjustmentsView stores={stores} allItems={items} />
                    </TabsContent>
                )}
                 {isAdmin && (
                    <TabsContent value="categories" className="mt-4">
                    <CategoriesView />
                    </TabsContent>
                )}
            </>
        )}
      </Tabs>
    </div>
  );
}
