'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


const EntryForm = () => (
    <Card>
        <CardHeader><CardTitle>Registrar Entrada de Mercancía</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">Aquí registrarás la mercancía nueva que llega de una tienda a tu almacén.</p>
             <div>
                <Label>Tienda</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecciona la tienda..." /></SelectTrigger><SelectContent></SelectContent></Select>
             </div>
             {/* TODO: Implementar tabla editable para agregar productos */}
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Tabla de productos a ingresar (funcionalidad pendiente).
            </div>
            <Button disabled>Confirmar Entrada</Button>
        </CardContent>
    </Card>
)

const ExitForm = () => (
     <Card>
        <CardHeader><CardTitle>Registrar Salida Manual</CardTitle></CardHeader>
        <CardContent className="space-y-4">
             <p className="text-muted-foreground text-sm">Usa este formulario para salidas que no son por pedidos (ej. devolución a tienda, merma).</p>
             <div>
                <Label>Tienda</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecciona la tienda..." /></SelectTrigger><SelectContent></SelectContent></Select>
             </div>
              {/* TODO: Implementar tabla editable para retirar productos */}
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Tabla de productos a retirar (funcionalidad pendiente).
            </div>
            <Button variant="destructive" disabled>Confirmar Salida</Button>
        </CardContent>
    </Card>
)

const AdjustmentForm = () => (
      <Card>
        <CardHeader><CardTitle>Ajuste de Inventario (Reconciliación)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
             <p className="text-muted-foreground text-sm">Usa esta herramienta después de un conteo físico para reconciliar el stock.</p>
             <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                    <Label>Producto</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Selecciona un producto..." /></SelectTrigger><SelectContent></SelectContent></Select>
                </div>
                <div><Label>Stock en Sistema</Label><Input disabled placeholder="0" /></div>
                <div><Label>Stock Real (Conteo)</Label><Input placeholder="0" /></div>
             </div>
            {/* TODO: Implementar lógica de ajuste y motivo */}
            <Button disabled>Realizar Ajuste</Button>
        </CardContent>
    </Card>
)

export function AdjustmentsView() {
  return (
    <Tabs defaultValue="entry" className="w-full">
        <TabsList>
          <TabsTrigger value="entry">Entrada de Mercancía</TabsTrigger>
          <TabsTrigger value="exit">Salida Manual</TabsTrigger>
          <TabsTrigger value="adjustment">Ajuste de Inventario</TabsTrigger>
        </TabsList>
        <TabsContent value="entry" className="mt-4">
          <EntryForm />
        </TabsContent>
        <TabsContent value="exit" className="mt-4">
          <ExitForm />
        </TabsContent>
        <TabsContent value="adjustment" className="mt-4">
            <AdjustmentForm />
        </TabsContent>
      </Tabs>
  );
}
