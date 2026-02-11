'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Settings2 } from "lucide-react";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { ArticlesView } from "@/components/inventory/ArticlesView";
import { MovementsView } from "@/components/inventory/MovementsView";
import { AdjustmentsView } from "@/components/inventory/AdjustmentsView";
import { useAuth } from "@/context/auth-context";


export default function InventarioPage() {
  const { user } = useAuth();
  const isClient = user?.role === 'client';

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
      
      <InventoryDashboard />
      
      <Tabs defaultValue="articles" className="w-full">
        <TabsList>
          <TabsTrigger value="articles"><Package className="mr-2 h-4 w-4" /> Artículos</TabsTrigger>
          <TabsTrigger value="movements"><Truck className="mr-2 h-4 w-4" /> Movimientos</TabsTrigger>
          {!isClient && <TabsTrigger value="adjustments"><Settings2 className="mr-2 h-4 w-4" /> Entradas, Salidas y Ajustes</TabsTrigger>}
        </TabsList>
        <TabsContent value="articles" className="mt-4">
          <ArticlesView />
        </TabsContent>
        <TabsContent value="movements" className="mt-4">
          <MovementsView />
        </TabsContent>
        <TabsContent value="adjustments" className="mt-4">
          <AdjustmentsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
