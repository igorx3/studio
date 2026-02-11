'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, Query } from 'firebase/firestore';
import { useAuth } from "@/context/auth-context";
import { FirebaseContext } from '@/firebase/context';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Settings2, Loader2 } from "lucide-react";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { ArticlesView } from "@/components/inventory/ArticlesView";
import { MovementsView } from "@/components/inventory/MovementsView";
import { AdjustmentsView } from "@/components/inventory/AdjustmentsView";
import type { InventoryItem, Store } from '@/lib/types';


export default function InventarioPage() {
  const { user } = useAuth();
  const firebaseContext = React.useContext(FirebaseContext);
  const firestore = firebaseContext?.firestore;

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isClient = user?.role === 'client';

  useEffect(() => {
    if (!firestore) return;

    // Listener for stores
    const storesCollection = collection(firestore, 'stores');
    const storesUnsubscribe = onSnapshot(storesCollection, (snapshot) => {
      const storesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
      setStores(storesData);
    });

    // Listener for inventory items
    let inventoryQuery: Query = collection(firestore, 'inventory');
    // If the user is a client, only fetch their items
    if (isClient && user.storeId) {
      inventoryQuery = query(inventoryQuery, where('storeId', '==', user.storeId));
    }
    
    const inventoryUnsubscribe = onSnapshot(inventoryQuery, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setItems(itemsData);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching inventory items:", error);
        setIsLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      storesUnsubscribe();
      inventoryUnsubscribe();
    };
  }, [firestore, isClient, user?.storeId]);


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
        <InventoryDashboard items={items} />
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
                <ArticlesView items={items} stores={stores} />
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
