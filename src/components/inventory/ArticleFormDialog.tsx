'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Paperclip, ChevronDown, Droplets } from 'lucide-react';
import type { InventoryItem, Store, InventoryMovement, InventoryItemPrivate } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { FirebaseContext } from '@/firebase/context';
import { collection, addDoc, serverTimestamp, getDocs, query, where, runTransaction, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { Switch } from '../ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '@/lib/utils';


const warehouseLocations = ['Q1', 'Q2', 'K1', 'K2', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12'];

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  sku: z.string().min(1, 'El SKU es obligatorio.'),
  storeId: z.string().min(1, 'Debes seleccionar una tienda.'),
  declaredValue: z.coerce.number().min(0, 'El valor debe ser positivo.'),
  stockAvailable: z.coerce.number().int().min(0, 'El stock debe ser un número entero positivo.'),
  minStock: z.coerce.number().int().min(0, 'El stock mínimo debe ser un número entero positivo.'),
  idealStock: z.coerce.number().int().min(0, 'El stock ideal debe ser un número entero positivo.'),
  category: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  warehouseLocation: z.enum(warehouseLocations as [string, ...string[]]).optional(),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  expirationDate: z.string().optional(),
  photo: z.any().optional(),
  
  dropshippingEnabled: z.boolean().default(false),
  dropshippingCost: z.coerce.number().optional(),
  dropshippingMinPrice: z.coerce.number().optional(),
  dropshippingSuggestedPrice: z.coerce.number().optional(),
  dropshippingFee: z.coerce.number().optional(),
  dropshippingFeeType: z.enum(['fixed', 'percentage']).default('fixed'),
  dropshippingDescription: z.string().optional(),
  dropshippingCategory: z.string().optional(),

}).refine(data => data.idealStock > data.minStock, {
    message: "El stock ideal debe ser mayor que el stock mínimo.",
    path: ["idealStock"],
});

type FormData = z.infer<typeof formSchema>;

export function ArticleFormDialog({ isOpen, onOpenChange, article, stores }: { isOpen: boolean, onOpenChange: (open: boolean) => void, article?: InventoryItem | null, stores: Store[] }) {
  const { user } = useAuth();
  const { firestore, storage } = useContext(FirebaseContext);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [privateData, setPrivateData] = useState<InventoryItemPrivate | null>(null);
  const [isDropshippingOpen, setIsDropshippingOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { minStock: 10, idealStock: 20 }
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'operations';

  useEffect(() => {
    const fetchPrivateData = async () => {
        if (article && isAdmin && firestore) {
            const privateRef = doc(firestore, 'inventory', article.id, 'private', 'pricing');
            const privateSnap = await getDoc(privateRef);
            if (privateSnap.exists()) {
                setPrivateData(privateSnap.data() as InventoryItemPrivate);
            }
        }
    }

    if (isOpen) {
      if (article) {
        fetchPrivateData();
        form.reset({
          name: article.name,
          sku: article.sku,
          storeId: article.storeId,
          declaredValue: article.declaredValue,
          stockAvailable: article.stockAvailable,
          minStock: article.minStock || 0,
          idealStock: article.idealStock || 0,
          category: article.category,
          description: article.description,
          barcode: article.barcode,
          warehouseLocation: article.warehouseLocation,
          weight: article.weight,
          length: article.dimensions?.length,
          width: article.dimensions?.width,
          height: article.dimensions?.height,
          expirationDate: article.expirationDate ? new Date(article.expirationDate.seconds * 1000).toISOString().split('T')[0] : '',
          dropshippingEnabled: article.dropshipping?.enabled || false,
          dropshippingMinPrice: article.dropshipping?.minPrice,
          dropshippingSuggestedPrice: article.dropshipping?.suggestedPrice,
          dropshippingFee: article.dropshipping?.fee,
          dropshippingFeeType: article.dropshipping?.feeType,
          dropshippingDescription: article.dropshipping?.description,
          dropshippingCategory: article.dropshipping?.category,
        });
        setPreviewImage(article.photos?.[0] || null);
        setIsDropshippingOpen(article.dropshipping?.enabled || false);
      } else {
        form.reset({
          name: '', sku: '', storeId: '', declaredValue: 0, stockAvailable: 0,
          minStock: 10, idealStock: 20, category: '', description: '', barcode: '',
          warehouseLocation: undefined, weight: 0, length: 0, width: 0, height: 0,
          expirationDate: '', photo: undefined,
          dropshippingEnabled: false
        });
        setPreviewImage(null);
        setPrivateData(null);
        setIsDropshippingOpen(false);
      }
    }
  }, [article, isOpen, form, isAdmin, firestore]);

  useEffect(() => {
    if (privateData) {
        form.setValue('dropshippingCost', privateData.cost);
    }
  }, [privateData, form])


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (values: FormData) => {
    if (!firestore || !storage || !user) {
        toast({ variant: "destructive", title: "Error", description: "La conexión con la base de datos no está disponible." });
        return;
    }
    setIsSubmitting(true);
    
    try {
        const storeName = stores.find(s => s.id === values.storeId)?.name || 'N/A';
        const isNewArticle = !article;
        const articleId = isNewArticle ? doc(collection(firestore, 'id_generator')).id : article.id;
        
        if (isNewArticle || (article && article.sku !== values.sku)) {
            const skuQuery = query(collection(firestore, 'inventory'), where('storeId', '==', values.storeId), where('sku', '==', values.sku));
            const skuSnapshot = await getDocs(skuQuery);
            if (!skuSnapshot.empty) {
                toast({ variant: "destructive", title: "Error", description: "El SKU ya existe para esta tienda." });
                setIsSubmitting(false);
                return;
            }
        }

        let photoUrl = article?.photos?.[0] || '';
        if (values.photo instanceof File) {
            const storageRef = ref(storage, `inventory/${articleId}/photos/${values.photo.name}`);
            const uploadResult = await uploadBytes(storageRef, values.photo);
            photoUrl = await getDownloadURL(uploadResult.ref);
        }

        const itemData: Omit<InventoryItem, 'id' | 'createdAt'> = {
            name: values.name,
            sku: values.sku,
            storeId: values.storeId,
            storeName,
            declaredValue: values.declaredValue,
            stockAvailable: values.stockAvailable,
            stockReserved: isNewArticle ? 0 : article.stockReserved,
            stockTotal: (isNewArticle ? values.stockAvailable : article.stockReserved + values.stockAvailable),
            minStock: values.minStock,
            idealStock: values.idealStock,
            dimensions: { length: values.length || 0, width: values.width || 0, height: values.height || 0 },
            photos: photoUrl ? [photoUrl] : [],
            expirationDate: values.expirationDate ? new Date(values.expirationDate) : null,
            updatedAt: serverTimestamp(),
            category: values.category || '',
            description: values.description,
            barcode: values.barcode,
            warehouseLocation: values.warehouseLocation || 'P1',
            weight: values.weight || 0,
            status: 'active',
            dropshipping: {
                enabled: values.dropshippingEnabled,
                minPrice: values.dropshippingMinPrice || 0,
                suggestedPrice: values.dropshippingSuggestedPrice || 0,
                fee: values.dropshippingFee || 0,
                feeType: values.dropshippingFeeType,
                description: values.dropshippingDescription || '',
                photos: [], // TODO: implement dropshipping photo upload
                category: values.dropshippingCategory || '',
            }
        };

        await runTransaction(firestore, async (transaction) => {
            const invRef = doc(firestore, 'inventory', articleId);
            
            if (isNewArticle) {
                transaction.set(invRef, { ...itemData, createdAt: serverTimestamp() });
                if (values.stockAvailable > 0) {
                    const movementData: Omit<InventoryMovement, 'id'> = {
                        itemId: invRef.id, itemName: values.name, itemSku: values.sku,
                        storeId: values.storeId, storeName, movementType: 'initial_stock',
                        referenceId: invRef.id, referenceType: 'item_creation',
                        quantity: values.stockAvailable, stockBefore: 0, stockAfter: values.stockAvailable,
                        userId: user.uid, userName: user.name || 'N/A', createdAt: serverTimestamp(),
                    };
                    transaction.set(doc(collection(firestore, 'inventoryMovements')), movementData);
                }
            } else {
                const stockBefore = article.stockAvailable;
                const stockAfter = values.stockAvailable;
                const stockDifference = stockAfter - stockBefore;
                transaction.update(invRef, itemData);

                if (stockDifference !== 0) {
                     const movementData: Omit<InventoryMovement, 'id'> = {
                        itemId: article.id, itemName: values.name, itemSku: values.sku,
                        storeId: values.storeId, storeName, movementType: 'adjustment',
                        referenceId: article.id, referenceType: 'item_creation',
                        quantity: stockDifference, stockBefore, stockAfter,
                        userId: user.uid, userName: user.name || 'N/A',
                        notes: 'Ajuste manual desde edición de artículo.', createdAt: serverTimestamp(),
                    };
                    transaction.set(doc(collection(firestore, 'inventoryMovements')), movementData);
                }
            }

            if (isAdmin && values.dropshippingEnabled) {
                const privateRef = doc(firestore, 'inventory', articleId, 'private', 'pricing');
                transaction.set(privateRef, { cost: values.dropshippingCost || 0 });
            }
        });
        
        toast({ title: isNewArticle ? "Artículo Creado" : "Artículo Actualizado", description: `${values.name} ha sido guardado.` });
        onOpenChange(false);
    } catch (error: any) {
        console.error("Error saving article:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo guardar el artículo." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const dropshippingEnabled = form.watch('dropshippingEnabled');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>{article ? 'Editar Artículo' : 'Nuevo Artículo de Inventario'}</DialogTitle>
          <DialogDescription>
            {article ? 'Modifica los detalles de este artículo.' : 'Completa el formulario para agregar un nuevo producto al inventario.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Main Info */}
              <div className="md:col-span-2 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nombre del Producto*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="sku" render={({ field }) => (
                        <FormItem><FormLabel>SKU / Referencia*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                 </div>
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="storeId" render={({ field }) => (
                        <FormItem><FormLabel>Tienda*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!!article}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una tienda" /></SelectTrigger></FormControl>
                            <SelectContent>{stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>
              {/* Column 2: Photo */}
              <div className="space-y-2">
                <FormLabel>Foto del Producto</FormLabel>
                 <div className="aspect-square w-full bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    {previewImage ? <Image src={previewImage} alt="Preview" width={200} height={200} className="object-cover h-full w-full" /> : <Paperclip className="h-12 w-12 text-muted-foreground" />}
                </div>
                <FormControl>
                     <Input type="file" accept="image/*" onChange={handleFileChange} className="text-xs" />
                </FormControl>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <FormField control={form.control} name="declaredValue" render={({ field }) => (
                    <FormItem><FormLabel>Valor Declarado (RD$)*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stockAvailable" render={({ field }) => (
                    <FormItem><FormLabel>Stock {article ? 'Disponible*' : 'Inicial*'}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="minStock" render={({ field }) => (
                    <FormItem><FormLabel>Stock Mínimo*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="idealStock" render={({ field }) => (
                    <FormItem><FormLabel>Stock Ideal*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="warehouseLocation" render={({ field }) => (
                    <FormItem><FormLabel>Ubicación Almacén</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                            <SelectContent>{warehouseLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem>
                 )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>Peso (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="expirationDate" render={({ field }) => (
                    <FormItem><FormLabel>Fecha Vencimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            {isAdmin && (
                <Collapsible open={isDropshippingOpen} onOpenChange={setIsDropshippingOpen} className="space-y-4 rounded-lg border p-4">
                    <CollapsibleTrigger className="flex w-full items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <Droplets className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Dropshipping</span>
                        </div>
                        <ChevronDown className={cn("h-5 w-5 transition-transform", isDropshippingOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                         <FormField control={form.control} name="dropshippingEnabled" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5"><FormLabel>Habilitar para Dropshipping</FormLabel>
                                <FormDescription>Permitir que otras tiendas vendan este producto.</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                         )} />
                        {dropshippingEnabled && (
                            <div className="space-y-4 p-2">
                                <FormField control={form.control} name="dropshippingCost" render={({ field }) => (
                                    <FormItem><FormLabel>Costo del Producto (Privado)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="dropshippingMinPrice" render={({ field }) => (
                                        <FormItem><FormLabel>Precio Mínimo de Venta</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={form.control} name="dropshippingSuggestedPrice" render={({ field }) => (
                                        <FormItem><FormLabel>Precio de Venta Sugerido</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                 <FormField control={form.control} name="dropshippingDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción para Catálogo</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                {/* TODO: Add fields for fee, feeType, category */}
                            </div>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {article ? 'Guardar Cambios' : 'Crear Artículo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
