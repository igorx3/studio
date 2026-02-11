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
import { Loader2, Paperclip } from 'lucide-react';
import type { InventoryItem, Store, User, SubLocation } from '@/lib/types';
import { FirebaseContext } from '@/firebase/context';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';

interface ArticleFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  article?: InventoryItem | null;
  stores: Store[];
}

const warehouseLocations: SubLocation[] = ['Q1', 'Q2', 'K1', 'K2', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12'];

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  sku: z.string().min(1, 'El SKU es obligatorio.'),
  storeId: z.string().min(1, 'Debes seleccionar una tienda.'),
  declaredValue: z.coerce.number().min(0, 'El valor debe ser positivo.'),
  stockAvailable: z.coerce.number().int().min(0, 'El stock debe ser un número entero positivo.'),
  minStock: z.coerce.number().int().min(0, 'El stock mínimo debe ser un número entero positivo.'),
  category: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  warehouseLocation: z.enum(warehouseLocations).optional(),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  expirationDate: z.string().optional(),
  photo: z.any().optional(),
});

export function ArticleFormDialog({ isOpen, onOpenChange, article, stores }: ArticleFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const firebaseContext = useContext(FirebaseContext);
  const firestore = firebaseContext?.firestore;
  const storage = firebaseContext?.storage;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      sku: '',
      storeId: '',
      declaredValue: 0,
      stockAvailable: 0,
      minStock: 10,
      category: '',
      description: '',
      barcode: '',
      warehouseLocation: undefined,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      expirationDate: '',
      photo: undefined,
    },
  });

  useEffect(() => {
    if (article) {
      form.reset({
        name: article.name,
        sku: article.sku,
        storeId: article.storeId,
        declaredValue: article.declaredValue,
        stockAvailable: article.stockAvailable,
        minStock: article.minStock,
        category: article.category,
        description: article.description,
        barcode: article.barcode,
        warehouseLocation: article.warehouseLocation,
        weight: article.weight,
        length: article.dimensions?.length,
        width: article.dimensions?.width,
        height: article.dimensions?.height,
        expirationDate: article.expirationDate ? new Date(article.expirationDate.seconds * 1000).toISOString().split('T')[0] : '',
      });
      if (article.photos && article.photos.length > 0) {
        setPreviewImage(article.photos[0]);
      }
    } else {
      form.reset();
      setPreviewImage(null);
    }
  }, [article, form, isOpen]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !storage || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'La base de datos no está disponible.' });
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. SKU uniqueness check
      const inventoryCollection = collection(firestore, 'inventory');
      const q = query(inventoryCollection, where('storeId', '==', values.storeId), where('sku', '==', values.sku));
      const skuSnapshot = await getDocs(q);
      if (!skuSnapshot.empty && (!article || skuSnapshot.docs[0].id !== article.id)) {
        toast({ variant: 'destructive', title: 'Error de SKU', description: 'Este SKU ya existe para la tienda seleccionada.' });
        setIsSubmitting(false);
        return;
      }
      
      const storeName = stores.find(s => s.id === values.storeId)?.name || 'N/A';
      const stockTotal = (article?.stockReserved || 0) + values.stockAvailable;

      let photoUrl: string | undefined = article?.photos?.[0];

      if (values.photo) {
        const file: File = values.photo;
        const fileRef = ref(storage, `inventory/${article?.id || 'new'}/${file.name}`);
        const uploadResult = await uploadBytes(fileRef, file);
        photoUrl = await getDownloadURL(uploadResult.ref);
      }

      const dataToSave = {
          name: values.name,
          sku: values.sku,
          storeId: values.storeId,
          storeName: storeName,
          declaredValue: values.declaredValue,
          stockAvailable: values.stockAvailable,
          minStock: values.minStock,
          stockTotal: stockTotal,
          status: stockTotal > 0 ? 'active' : 'depleted',
          category: values.category || '',
          description: values.description || '',
          barcode: values.barcode || '',
          warehouseLocation: values.warehouseLocation,
          weight: values.weight || 0,
          dimensions: {
              length: values.length || 0,
              width: values.width || 0,
              height: values.height || 0,
          },
          expirationDate: values.expirationDate ? new Date(values.expirationDate) : null,
          photos: photoUrl ? [photoUrl] : [],
          updatedAt: serverTimestamp(),
      };


      if (article) {
        // Update existing article
        const articleRef = doc(firestore, 'inventory', article.id);
        await updateDoc(articleRef, dataToSave);

        // TODO: Create 'adjustment' movement if stock changed manually
        if (article.stockAvailable !== values.stockAvailable) {
            console.log("Stock was adjusted. An 'adjustment' movement should be created here.");
        }

        toast({ title: 'Artículo actualizado', description: 'El artículo ha sido actualizado correctamente.' });
      } else {
        // Create new article
        const docRef = await addDoc(collection(firestore, 'inventory'), {
            ...dataToSave,
            stockReserved: 0,
            createdAt: serverTimestamp(),
        });
        
        // Create initial movement
        if(values.stockAvailable > 0) {
            await addDoc(collection(firestore, 'inventoryMovements'), {
                itemId: docRef.id,
                itemName: values.name,
                itemSku: values.sku,
                storeId: values.storeId,
                storeName: storeName,
                movementType: 'manual_entry',
                referenceId: docRef.id,
                referenceType: 'entry',
                quantity: values.stockAvailable,
                stockBefore: 0,
                stockAfter: values.stockAvailable,
                userId: user.uid,
                userName: user.name,
                notes: 'Entrada inicial de inventario',
                createdAt: serverTimestamp(),
            });
        }
        
        toast({ title: 'Artículo creado', description: 'El nuevo artículo ha sido agregado al inventario.' });
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving article:", error);
      toast({ variant: 'destructive', title: 'Error al guardar', description: 'No se pudo guardar el artículo. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!!article}>
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
                <FormMessage />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <FormField control={form.control} name="declaredValue" render={({ field }) => (
                    <FormItem><FormLabel>Valor Declarado (RD$)*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stockAvailable" render={({ field }) => (
                    <FormItem><FormLabel>Stock Inicial/Disponible*</FormLabel><FormControl><Input type="number" {...field} disabled={!!article} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="minStock" render={({ field }) => (
                    <FormItem><FormLabel>Punto de Reorden*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="warehouseLocation" render={({ field }) => (
                    <FormItem><FormLabel>Ubicación Almacén</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                            <SelectContent>{warehouseLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem>
                 )} />
            </div>

             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>Peso (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="length" render={({ field }) => (
                    <FormItem><FormLabel>Largo (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="width" render={({ field }) => (
                    <FormItem><FormLabel>Ancho (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem><FormLabel>Alto (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="expirationDate" render={({ field }) => (
                    <FormItem><FormLabel>Fecha Vencimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

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
