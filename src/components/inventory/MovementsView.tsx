'use client';
import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { FirebaseContext } from '@/firebase/context';
import type { InventoryMovement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';

export function MovementsView() {
  const firebaseContext = useContext(FirebaseContext);
  const firestore = firebaseContext?.firestore;

  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const movementsQuery = query(
      collection(firestore, 'inventoryMovements'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(movementsQuery, (snapshot) => {
      const movementsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryMovement));
      setMovements(movementsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching movements:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos Movimientos de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Add filters for product, store, type, and date range */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead>Stock Anterior</TableHead>
                <TableHead>Stock Resultante</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Referencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No hay movimientos de inventario registrados.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map(mov => (
                  <TableRow key={mov.id}>
                    <TableCell>{new Date(mov.createdAt?.seconds * 1000).toLocaleString()}</TableCell>
                    <TableCell>
                        <div className="font-medium">{mov.itemName}</div>
                        <div className="text-xs text-muted-foreground">{mov.itemSku}</div>
                    </TableCell>
                    <TableCell>{mov.movementType}</TableCell>
                    <TableCell className={`text-center font-bold ${mov.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                    </TableCell>
                    <TableCell>{mov.stockBefore}</TableCell>
                    <TableCell>{mov.stockAfter}</TableCell>
                    <TableCell>{mov.userName}</TableCell>
                    <TableCell>{mov.referenceId}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        {/* TODO: Add pagination */}
      </CardContent>
    </Card>
  );
}
