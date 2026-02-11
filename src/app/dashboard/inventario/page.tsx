'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import { useAuth } from "@/context/auth-context";
import React from 'react';
import { FirebaseContext } from '@/firebase/context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Settings2, Loader2 } from "lucide-react";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { ArticlesView } from "@/components/inventory/ArticlesView";
import { MovementsView } from "@/components/inventory/MovementsView";
import { AdjustmentsView } from "@/components/inventory/AdjustmentsView";
import type { InventoryItem, Store } from '@/lib/types';


export default function InventarioPage() {
  const { user } = useAuth();
  const { firestore, isInitializing } = useContext(FirebaseContext);
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isClient = user?.role === 'client';

  // Fetch Stores
  useEffect(() => {
    if (!firestore || isInitializing) return;
    const storesQuery = query(collection(firestore, 'stores'));
    const unsubscribe = onSnapshot(storesQuery, (snapshot) => {
      const storesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
      setStores(storesData);
    }, (error) => {
        console.error("Error fetching stores: ", error);
    });
    return () => unsubscribe();
  }, [firestore, isInitializing]);

  // Fetch Inventory Items
  useEffect(() => {
    if (!firestore || isInitializing) {
        setIsLoading(true);
        return;
    };
    
    let itemsQuery;
    if (isClient && user?.storeId) {
      itemsQuery = query(collection(firestore, 'inventory'), where('storeId', '==', user.storeId));
    } else {
      itemsQuery = query(collection(firestore, 'inventory'));
    }

    const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setItems(itemsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching inventory items:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [firestore, isInitializing, isClient, user?.storeId]);


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
          {!isClient && <TabsTrigger value="adjustments"><Settings2 className="mr-2 h-4 w-4" /> Entradas, Salidas y Ajustes</TabsTrigger>}
        </TabsList>
        {isLoading && !isInitializing ? (
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
                {!isClient && (
                    <TabsContent value="adjustments" className="mt-4">
                    <AdjustmentsView stores={stores} allItems={items} />
                    </TabsContent>
                )}
            </>
        )}
      </Tabs>
    </div>
  );
}
