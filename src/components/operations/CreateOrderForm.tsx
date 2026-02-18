'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { Order, ServiceType, ProductLineItem, Store, InventoryItem } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, orderBy } from 'firebase/firestore';

interface CreateOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: (order: Order) => void;
}

interface ProductRow {
  itemId: string | 'custom';
  name: string;
  sku: string;
  quantity: number;
  price: number;
  isCustom: boolean;
}

const emptyProduct: ProductRow = {
  itemId: 'custom',
  name: '',
  sku: '',
  quantity: 1,
  price: 0,
  isCustom: true,
};

export default function CreateOrderForm({ open, onOpenChange, onOrderCreated }: CreateOrderFormProps) {
  const firestore = useFirestore();
  const { isUserLoading: isAuthLoading } = useUser();
  const { user } = useAuth();

  const [storeId, setStoreId] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('logistics_360');
  const [paymentType, setPaymentType] = useState<'cod' | 'prepaid'>('cod');
  const [codAmount, setCodAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientCity, setRecipientCity] = useState('');
  const [recipientSector, setRecipientSector] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([{ ...emptyProduct }]);
  const [notes, setNotes] = useState('');

  // Fetch stores
  const storesQuery = useMemoFirebase(() => {
    if (isAuthLoading || !firestore) return null;
    return query(collection(firestore, 'stores'), where('status', '==', 'active'), orderBy('name'));
  }, [firestore, isAuthLoading]);

  const { data: storesData, isLoading: storesLoading } = useCollection<Store>(storesQuery);
  const stores = useMemo(() => storesData || [], [storesData]);

  // Fetch inventory items for selected store
  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore || !storeId) return null;
    return query(
      collection(firestore, 'inventory'),
      where('storeId', '==', storeId),
      where('status', '==', 'active'),
      orderBy('name')
    );
  }, [firestore, storeId]);

  const { data: inventoryData, isLoading: inventoryLoading } = useCollection<InventoryItem>(inventoryQuery);
  const inventoryItems = useMemo(() => inventoryData || [], [inventoryData]);

  const selectedStore = stores.find(s => s.id === storeId);

  const resetForm = () => {
    setStoreId('');
    setServiceType('logistics_360');
    setPaymentType('cod');
    setCodAmount('');
    setRecipientName('');
    setRecipientPhone('');
    setRecipientCity('');
    setRecipientSector('');
    setRecipientAddress('');
    setProducts([{ ...emptyProduct }]);
    setNotes('');
  };

  const handleClose = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  const addProduct = () => {
    setProducts([...products, { ...emptyProduct }]);
  };

  const removeProduct = (index: number) => {
    if (products.length <= 1) return;
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ProductRow, value: string | number | boolean) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleProductSelect = (index: number, inventoryItemId: string) => {
    if (inventoryItemId === 'custom') {
      updateProduct(index, 'itemId', 'custom');
      updateProduct(index, 'isCustom', true);
      updateProduct(index, 'name', '');
      updateProduct(index, 'sku', '');
      updateProduct(index, 'price', 0);
    } else {
      const item = inventoryItems.find(i => i.id === inventoryItemId);
      if (item) {
        updateProduct(index, 'itemId', inventoryItemId);
        updateProduct(index, 'isCustom', false);
        updateProduct(index, 'name', item.name);
        updateProduct(index, 'sku', item.sku);
        updateProduct(index, 'price', item.normalPrice || 0);
      }
    }
  };

  const productTotal = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  const canSubmit =
    storeId &&
    recipientName.trim() &&
    recipientPhone.trim() &&
    recipientCity.trim() &&
    recipientAddress.trim() &&
    products.some(p => p.name.trim() && p.quantity > 0 && p.price > 0) &&
    (paymentType === 'prepaid' || (paymentType === 'cod' && Number(codAmount) > 0));

  const handleSubmit = () => {
    if (!canSubmit || !selectedStore) return;

    const trackingId = `POD${String(Date.now()).slice(-4)}`;
    const validProducts: ProductLineItem[] = products
      .filter(p => p.name.trim() && p.quantity > 0)
      .map((p, i) => ({
        itemId: p.itemId || `new-${Date.now()}-${i}`,
        name: p.name,
        sku: p.sku || `SKU-${Date.now()}-${i}`,
        quantity: p.quantity,
        price: p.price,
      }));

    const rates = selectedStore.rates;
    const freightCost = serviceType !== 'fulfillment' ? rates.freight : 0;
    const fulfillmentCost = serviceType === 'fulfillment' ? rates.fulfillment : 0;
    const serviceFee = rates.serviceFee;
    const totalCost = freightCost + fulfillmentCost + serviceFee;
    const cod = paymentType === 'cod' ? Number(codAmount) : 0;

    const newOrder: Order = {
      id: `new-${Date.now()}`,
      trackingId,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      serviceType,
      status: 'Generado',
      paymentType,
      codAmount: cod,
      collectedFromCourier: false,
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        city: recipientCity,
        sector: recipientSector,
        address: recipientAddress,
      },
      recipientId: recipientPhone,
      products: validProducts,
      costs: {
        freight: freightCost,
        fulfillment: fulfillmentCost,
        serviceFee,
        total: totalCost,
        netToStore: cod - totalCost,
      },
      warehouse: { packingStatus: 'pending' },
      isDraft: false,
      createdBy: user?.uid || 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      externalOrderReference: trackingId,
      client: selectedStore.name,
      recipientName,
      recipientPhone,
      cashOnDeliveryAmount: cod,
      financials: {
        codAmount: cod,
        collectedFromCourier: false,
        freightCost,
        fulfillmentCost,
        serviceFee,
        totalCost,
        netToLiquidate: cod - totalCost,
      },
    };

    onOrderCreated(newOrder);
    resetForm();
    onOpenChange(false);
  };

  if (!firestore || isAuthLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">Nuevo Pedido</DialogTitle>
          <DialogDescription>
            Completa los datos para crear un nuevo pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-6">
          {/* Tienda y Servicio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store">Tienda *</Label>
              <Select value={storeId} onValueChange={setStoreId} disabled={storesLoading}>
                <SelectTrigger id="store">
                  {storesLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Seleccionar tienda" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo de Servicio *</Label>
              <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
                <SelectTrigger id="serviceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logistics_360">Logística 360</SelectItem>
                  <SelectItem value="logistics_180">Logística 180</SelectItem>
                  <SelectItem value="fulfillment">Fulfillment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentType">Tipo de Pago *</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as 'cod' | 'prepaid')}>
                <SelectTrigger id="paymentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Contra Entrega (COD)</SelectItem>
                  <SelectItem value="prepaid">Prepago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {paymentType === 'cod' && (
            <div className="max-w-xs space-y-2">
              <Label htmlFor="codAmount">Monto COD (RD$) *</Label>
              <Input
                id="codAmount"
                type="number"
                min="0"
                placeholder="0.00"
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
              />
            </div>
          )}

          <Separator />

          {/* Destinatario */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Datos del Destinatario</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nombre *</Label>
                <Input
                  id="recipientName"
                  placeholder="Nombre completo"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Teléfono *</Label>
                <Input
                  id="recipientPhone"
                  placeholder="809-000-0000"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientCity">Ciudad *</Label>
                <Input
                  id="recipientCity"
                  placeholder="Ej: Santo Domingo"
                  value={recipientCity}
                  onChange={(e) => setRecipientCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientSector">Sector</Label>
                <Input
                  id="recipientSector"
                  placeholder="Ej: Naco"
                  value={recipientSector}
                  onChange={(e) => setRecipientSector(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="recipientAddress">Dirección *</Label>
                <Input
                  id="recipientAddress"
                  placeholder="Calle, número, referencia"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Productos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Productos</h3>
              <Button type="button" variant="outline" size="sm" onClick={addProduct} disabled={!storeId || inventoryLoading}>
                <Plus className="mr-1 h-3 w-3" />
                Agregar
              </Button>
            </div>
            {!storeId ? (
              <p className="text-sm text-muted-foreground">Selecciona una tienda para agregar productos.</p>
            ) : inventoryLoading ? (
              <div className="flex items-center justify-center py-4 gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando productos...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product, index) => (
                  <div key={index} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 items-end">
                    <div className="space-y-1 w-48">
                      {index === 0 && <Label className="text-xs">Producto *</Label>}
                      <Select value={product.itemId} onValueChange={(v) => handleProductSelect(index, v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">+ Personalizado</SelectItem>
                          {inventoryItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.stockAvailable} disponibles)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 flex-1">
                      {index === 0 && <Label className="text-xs">Nombre *</Label>}
                      <Input
                        placeholder="Nombre del producto"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        disabled={!product.isCustom}
                      />
                    </div>
                    <div className="space-y-1 w-20">
                      {index === 0 && <Label className="text-xs">Cant. *</Label>}
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-1 w-24">
                      {index === 0 && <Label className="text-xs">Precio (RD$) *</Label>}
                      <Input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={product.price || ''}
                        onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                        disabled={!product.isCustom}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                      onClick={() => removeProduct(index)}
                      disabled={products.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {productTotal > 0 && (
              <p className="text-sm text-muted-foreground mt-2 text-right">
                Total productos: <span className="font-medium text-foreground">RD$ {productTotal.toLocaleString()}</span>
              </p>
            )}
          </div>

          <Separator />

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Instrucciones especiales de entrega..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Resumen de Costos */}
          {selectedStore && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">Resumen de Costos</h3>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                  {serviceType !== 'fulfillment' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flete</span>
                      <span>RD$ {selectedStore.rates.freight.toLocaleString()}</span>
                    </div>
                  )}
                  {serviceType === 'fulfillment' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fulfillment</span>
                      <span>RD$ {selectedStore.rates.fulfillment.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicio</span>
                    <span>RD$ {selectedStore.rates.serviceFee.toLocaleString()}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-medium">
                    <span>Total costos</span>
                    <span>RD$ {(
                      (serviceType !== 'fulfillment' ? selectedStore.rates.freight : selectedStore.rates.fulfillment) +
                      selectedStore.rates.serviceFee
                    ).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Crear Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
