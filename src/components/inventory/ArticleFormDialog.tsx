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
        expirationDate: article.expirationDate ? new Date(article.expirationDate).toISOString().split('T')[0] : '',
      });
      if (article.photos && article.photos.length > 0) {
        setPreviewImage(article.photos[0]);
      }
    } else {
      form.reset({
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
      });
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
    setIsSubmitting(true);
    console.log("Form Submitted (Demo):", values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Funcionalidad en Desarrollo',
      description: 'La creación y edición de artículos se conectará a la base de datos en la siguiente fase.',
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
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
                    <FormItem><FormLabel>Stock Inicial/Disponible*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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
