'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Paperclip, ChevronDown, Droplets, Trash2, UploadCloud } from 'lucide-react';
import type { InventoryItem, Store, InventoryMovement, InventoryItemPrivate, PackageLocation, WarehouseSubLocation, ArticleCategory } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { FirebaseContext } from '@/firebase/context';
import { collection, addDoc, serverTimestamp, getDocs, query, where, runTransaction, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Image from 'next/image';
import { Switch } from '../ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '@/lib/utils';


const packageLocations: PackageLocation[] = ['alistamiento', 'despacho', 'recepcion', 'en_ruta'];
const warehouseSubLocations: WarehouseSubLocation[] = ['Q1', 'Q2', 'K1', 'K2', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12'];

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  sku: z.string().min(1, 'El SKU es obligatorio.'),
  storeId: z.string().min(1, 'Debes seleccionar una tienda.'),
  declaredValue: z.coerce.number().min(0, 'El valor debe ser positivo.'),
  initialStock: z.coerce.number().int().min(0, 'El stock debe ser un número entero positivo.'),
  stockAvailable: z.coerce.number().int().min(0, 'El stock debe ser un número entero positivo.'),
  minStock: z.coerce.number().int().min(0, 'El stock mínimo debe ser un número entero positivo.'),
  idealStock: z.coerce.number().int().min(0, 'El stock ideal debe ser un número entero positivo.'),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  packageLocation: z.enum(packageLocations as [string, ...string[]]).optional(),
  warehouseSubLocation: z.enum(warehouseSubLocations as [string, ...string[]]).optional(),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  expirationDate: z.string().optional(),
  photos: z.any().optional(),
  
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
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [privateData, setPrivateData] = useState<InventoryItemPrivate | null>(null);
  const [isDropshippingOpen, setIsDropshippingOpen] = useState(false);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { minStock: 10, idealStock: 20 }
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'operations';

   useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, "articleCategories"), where("status", "==", "active"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArticleCategory));
      setCategories(cats);
    });
    return () => unsubscribe();
  }, [firestore]);

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
      setNewImageFiles([]);
      if (article) {
        fetchPrivateData();
        form.reset({
          name: article.name,
          sku: article.sku,
          storeId: article.storeId,
          declaredValue: article.declaredValue,
          initialStock: article.initialStock,
          stockAvailable: article.stockAvailable, // used for display
          minStock: article.minStock || 0,
          idealStock: article.idealStock || 0,
          categoryId: article.category, // assuming category stores categoryId
          description: article.description,
          barcode: article.barcode,
          packageLocation: article.packageLocation,
          warehouseSubLocation: article.warehouseSubLocation,
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
        setPreviewImages(article.photos || []);
        setIsDropshippingOpen(article.dropshipping?.enabled || false);
      } else {
        form.reset({
          name: '', sku: '', storeId: '', declaredValue: 0, initialStock: 0, stockAvailable: 0,
          minStock: 10, idealStock: 20, categoryId: '', description: '', barcode: '',
          packageLocation: 'recepcion', warehouseSubLocation: undefined, weight: 0, length: 0, width: 0, height: 0,
          expirationDate: '', photos: undefined,
          dropshippingEnabled: false
        });
        setPreviewImages([]);
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
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setNewImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
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
        
        let photoUrls = article?.photos || [];
        if (newImageFiles.length > 0) {
            const uploadPromises = newImageFiles.map(file => {
                const storageRef = ref(storage, `inventory/${articleId}/photos/${Date.now()}_${file.name}`);
                return uploadBytes(storageRef, file).then(uploadResult => getDownloadURL(uploadResult.ref));
            });
            const newUrls = await Promise.all(uploadPromises);
            photoUrls = [...photoUrls, ...newUrls];
        }

        const itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
            name: values.name,
            sku: values.sku,
            storeId: values.storeId,
            storeName,
            declaredValue: values.declaredValue,
            initialStock: isNewArticle ? values.initialStock : article.initialStock,
            stockAvailable: isNewArticle ? values.initialStock : article.stockAvailable,
            stockReserved: isNewArticle ? 0 : article.stockReserved,
            stockTotal: isNewArticle ? values.initialStock : article.stockTotal,
            minStock: values.minStock,
            idealStock: values.idealStock,
            dimensions: { length: values.length || 0, width: values.width || 0, height: values.height || 0 },
            photos: photoUrls,
            expirationDate: values.expirationDate ? new Date(values.expirationDate) : null,
            category: values.categoryId || '',
            description: values.description,
            barcode: values.barcode,
            packageLocation: values.packageLocation,
            warehouseSubLocation: values.warehouseSubLocation,
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
                transaction.set(invRef, { ...itemData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                if (values.initialStock > 0) {
                    const movementData: Omit<InventoryMovement, 'id'|'createdAt'> = {
                        itemId: invRef.id, itemName: values.name, itemSku: values.sku,
                        storeId: values.storeId, storeName, movementType: 'initial_stock',
                        referenceId: invRef.id, referenceType: 'item_creation',
                        quantity: values.initialStock, stockBefore: 0, stockAfter: values.initialStock,
                        userId: user.uid, userName: user.name || 'N/A',
                        notes: 'Stock inicial al crear el artículo.'
                    };
                    transaction.set(doc(collection(firestore, 'inventoryMovements')), movementData);
                }
            } else {
                 transaction.update(invRef, { ...itemData, updatedAt: serverTimestamp() });
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
                     <FormField control={form.control} name="categoryId" render={({ field }) => (
                        <FormItem><FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                {/* TODO: Add inline category creation */}
                            </SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                </div>
              </div>
              <div className="space-y-2">
                <FormLabel>Fotos del Producto</FormLabel>
                 <div className="grid grid-cols-3 gap-2">
                    {previewImages.map((img, i) => (
                        <div key={i} className="relative aspect-square">
                            <Image src={img} alt="Preview" layout="fill" className="object-cover rounded-md" />
                        </div>
                    ))}
                    <label htmlFor="photo-upload" className="cursor-pointer aspect-square bg-muted rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-border transition-colors">
                        <UploadCloud className="h-8 w-8" />
                        <span className="text-xs mt-1 text-center">Subir fotos</span>
                    </label>
                    <Input id="photo-upload" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <FormField control={form.control} name="declaredValue" render={({ field }) => (
                    <FormItem><FormLabel>Valor Declarado (RD$)*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                {article ? (
                    <FormField control={form.control} name="initialStock" render={({ field }) => (
                        <FormItem><FormLabel>Stock Inicial</FormLabel><FormControl><Input type="number" {...field} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                ) : (
                    <FormField control={form.control} name="initialStock" render={({ field }) => (
                        <FormItem><FormLabel>Stock Inicial*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                
                <FormField control={form.control} name="minStock" render={({ field }) => (
                    <FormItem><FormLabel>Stock Mínimo*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="idealStock" render={({ field }) => (
                    <FormItem><FormLabel>Stock Ideal*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <FormField control={form.control} name="packageLocation" render={({ field }) => (
                    <FormItem><FormLabel>Ubicación Paquete</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                            <SelectContent>{packageLocations.map(loc => <SelectItem key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem>
                 )} />
                {isAdmin && <FormField control={form.control} name="warehouseSubLocation" render={({ field }) => (
                    <FormItem><FormLabel>Sub-ubicación Almacén</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                            <SelectContent>{warehouseSubLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem>
                 )} />}
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
