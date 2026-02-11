'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';

export function MovementsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos Movimientos de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">La funcionalidad de movimientos de inventario se conectará a la base de datos en la siguiente fase.</p>
          </div>
      </CardContent>
    </Card>
  );
}
