'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from '../ui/textarea';
import { X, PlusCircle, Loader2 } from 'lucide-react';
import type { InventoryItem, Store } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';


const EntryForm = ({ stores, allItems }: { stores: Store[], allItems: InventoryItem[] }) => {
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [storeId, setStoreId] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [lines, setLines] = useState([{ productId: '', quantity: '', warehouseLocation: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const storeItems = useMemo(() => allItems.filter(item => item.storeId === storeId), [allItems, storeId]);

    const handleAddLine = () => {
        setLines([...lines, { productId: '', quantity: '', warehouseLocation: '' }]);
    };

    const handleRemoveLine = (index: number) => {
        setLines(lines.filter((_, i) => i !== index));
    };

    const handleLineChange = (index: number, field: string, value: string) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const handleSubmit = async () => {
        if (!firestore || !user) return toast({ variant: 'destructive', title: 'Error de conexión' });
        if (!storeId || lines.some(l => !l.productId || !l.quantity)) {
            return toast({ variant: 'destructive', title: 'Campos incompletos', description: 'Selecciona una tienda y completa todos los productos.' });
        }
        setIsSubmitting(true);
        try {
            const transactionId = doc(collection(firestore, 'id_generator')).id;
            
            await runTransaction(firestore, async (transaction) => {
                const storeName = stores.find(s => s.id === storeId)?.name || 'N/A';
                const transactionItems = [];

                for (const line of lines) {
                    const quantity = parseInt(line.quantity, 10);
                    if (isNaN(quantity) || quantity <= 0) continue;

                    const itemRef = doc(firestore, 'inventory', line.productId);
                    const itemDoc = await transaction.get(itemRef);
                    if (!itemDoc.exists()) throw new Error(`El artículo con ID ${line.productId} no existe.`);
                    
                    const itemData = itemDoc.data() as InventoryItem;
                    const stockBefore = itemData.stockAvailable;
                    const stockAfter = stockBefore + quantity;

                    transaction.update(itemRef, { 
                        stockAvailable: stockAfter,
                        stockTotal: itemData.stockReserved + stockAfter
                    });

                    const movementRef = doc(collection(firestore, 'inventoryMovements'));
                    transaction.set(movementRef, {
                        itemId: itemDoc.id,
                        itemName: itemData.name,
                        itemSku: itemData.sku,
                        storeId: itemData.storeId,
                        storeName: itemData.storeName,
                        movementType: 'manual_entry',
                        referenceId: transactionId,
                        referenceType: 'entry',
                        quantity: quantity,
                        stockBefore,
                        stockAfter,
                        userId: user.uid,
                        userName: user.name,
                        createdAt: serverTimestamp(),
                    });
                    
                    transactionItems.push({
                        itemId: itemDoc.id,
                        itemName: itemData.name,
                        itemSku: itemData.sku,
                        quantity: quantity,
                        warehouseLocation: line.warehouseLocation,
                        condition: 'good',
                        notes: ''
                    });
                }
                
                const transactionRef = doc(firestore, 'inventoryTransactions', transactionId);
                transaction.set(transactionRef, {
                    type: 'entry',
                    storeId: storeId,
                    storeName: storeName,
                    items: transactionItems,
                    referenceNumber: referenceNumber,
                    photos: [],
                    processedBy: user.uid,
                    processedByName: user.name,
                    createdAt: serverTimestamp(),
                });
            });

            toast({ title: 'Éxito', description: `Entrada registrada con ${lines.length} productos.` });
            setStoreId('');
            setReferenceNumber('');
            setLines([{ productId: '', quantity: '', warehouseLocation: '' }]);
        } catch (error: any) {
            console.error("Error creating entry:", error);
            toast({ variant: 'destructive', title: 'Error en la transacción', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Registrar Entrada de Mercancía</CardTitle>
                <CardDescription>Aquí registrarás la mercancía nueva que llega de una tienda a tu almacén.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tienda</Label>
                        <Select value={storeId} onValueChange={setStoreId}>
                            <SelectTrigger><SelectValue placeholder="Selecciona la tienda..." /></SelectTrigger>
                            <SelectContent>{stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Número de Referencia/Guía</Label>
                        <Input value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} placeholder="Ej: GUIA-12345" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <Label>Productos a Ingresar</Label>
                    <div className="space-y-2 rounded-md border p-2">
                        {lines.map((line, index) => (
                            <div key={index} className="flex items-end gap-2 p-2 rounded-md bg-muted/50">
                                <div className="flex-1">
                                    <Label className="text-xs">Producto</Label>
                                    <Select value={line.productId} onValueChange={v => handleLineChange(index, 'productId', v)} disabled={!storeId}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona un producto..." /></SelectTrigger>
                                        <SelectContent>{storeItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.sku})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24">
                                     <Label className="text-xs">Cantidad</Label>
                                     <Input type="number" placeholder="0" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', e.target.value)} />
                                </div>
                                 <div className="w-32">
                                     <Label className="text-xs">Ubicación</Label>
                                     <Input placeholder="Ej: P1" value={line.warehouseLocation} onChange={e => handleLineChange(index, 'warehouseLocation', e.target.value)} />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveLine(index)}><X className="h-4 w-4" /></Button>
                            </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={handleAddLine}><PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto</Button>
                    </div>
                 </div>

                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar Entrada
                </Button>
            </CardContent>
        </Card>
    )
}

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

export function AdjustmentsView({ stores, allItems }: { stores: Store[], allItems: InventoryItem[] }) {
  return (
    <Tabs defaultValue="entry" className="w-full">
        <TabsList>
          <TabsTrigger value="entry">Entrada de Mercancía</TabsTrigger>
          <TabsTrigger value="exit">Salida Manual</TabsTrigger>
          <TabsTrigger value="adjustment">Ajuste de Inventario</TabsTrigger>
        </TabsList>
        <TabsContent value="entry" className="mt-4">
          <EntryForm stores={stores} allItems={allItems} />
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
