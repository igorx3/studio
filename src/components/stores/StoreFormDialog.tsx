'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Store } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  contactName: z.string().min(2, 'El nombre de contacto debe tener al menos 2 caracteres.'),
  email: z.string().email('Ingresa un email válido.'),
  phone: z.string().min(7, 'Ingresa un teléfono válido.'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres.'),
  logo: z.string().url('Ingresa una URL válida.').or(z.literal('')),
  ratesFreight: z.coerce.number().min(0, 'Debe ser positivo.'),
  ratesFulfillment: z.coerce.number().min(0, 'Debe ser positivo.'),
  ratesServiceFee: z.coerce.number().min(0, 'Debe ser positivo.'),
  returnFreightPercent: z.coerce.number().min(0).max(100),
  returnFulfillmentPercent: z.coerce.number().min(0).max(100),
  returnServiceFeePercent: z.coerce.number().min(0).max(100),
  cancelledFreightPercent: z.coerce.number().min(0).max(100),
  cancelledFulfillmentPercent: z.coerce.number().min(0).max(100),
  cancelledServiceFeePercent: z.coerce.number().min(0).max(100),
  status: z.enum(['active', 'inactive']).default('active'),
});

type FormData = z.infer<typeof formSchema>;

export function StoreFormDialog({ isOpen, onOpenChange, store }: { isOpen: boolean; onOpenChange: (open: boolean) => void; store?: Store | null }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (store) {
        form.reset({
          name: store.name,
          contactName: store.contactName,
          email: store.email,
          phone: store.phone,
          address: store.address,
          logo: store.logo || '',
          ratesFreight: store.rates?.freight ?? 0,
          ratesFulfillment: store.rates?.fulfillment ?? 0,
          ratesServiceFee: store.rates?.serviceFee ?? 0,
          returnFreightPercent: store.nonEffectiveFactor?.return?.freightPercent ?? 0,
          returnFulfillmentPercent: store.nonEffectiveFactor?.return?.fulfillmentPercent ?? 0,
          returnServiceFeePercent: store.nonEffectiveFactor?.return?.serviceFeePercent ?? 0,
          cancelledFreightPercent: store.nonEffectiveFactor?.cancelled?.freightPercent ?? 0,
          cancelledFulfillmentPercent: store.nonEffectiveFactor?.cancelled?.fulfillmentPercent ?? 0,
          cancelledServiceFeePercent: store.nonEffectiveFactor?.cancelled?.serviceFeePercent ?? 0,
          status: store.status,
        });
      } else {
        form.reset({
          name: '', contactName: '', email: '', phone: '', address: '', logo: '',
          ratesFreight: 0, ratesFulfillment: 0, ratesServiceFee: 0,
          returnFreightPercent: 0, returnFulfillmentPercent: 0, returnServiceFeePercent: 0,
          cancelledFreightPercent: 0, cancelledFulfillmentPercent: 0, cancelledServiceFeePercent: 0,
          status: 'active',
        });
      }
    }
  }, [store, isOpen, form]);

  const onSubmit = async (values: FormData) => {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      const storeData = {
        name: values.name,
        contactName: values.contactName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        logo: values.logo || '',
        rates: {
          freight: values.ratesFreight,
          fulfillment: values.ratesFulfillment,
          serviceFee: values.ratesServiceFee,
        },
        nonEffectiveFactor: {
          return: {
            freightPercent: values.returnFreightPercent,
            fulfillmentPercent: values.returnFulfillmentPercent,
            serviceFeePercent: values.returnServiceFeePercent,
          },
          cancelled: {
            freightPercent: values.cancelledFreightPercent,
            fulfillmentPercent: values.cancelledFulfillmentPercent,
            serviceFeePercent: values.cancelledServiceFeePercent,
          },
        },
        status: values.status,
      };

      if (store) {
        const storeRef = doc(firestore, 'stores', store.id);
        await updateDoc(storeRef, { ...storeData, updatedAt: serverTimestamp() });
        toast({ title: "Tienda Actualizada", description: `${values.name} ha sido guardada.` });
      } else {
        const collectionRef = collection(firestore, 'stores');
        await addDoc(collectionRef, {
          ...storeData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Tienda Creada", description: `${values.name} ha sido agregada.` });
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving store:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo guardar la tienda." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{store ? 'Editar Tienda' : 'Nueva Tienda'}</DialogTitle>
          <DialogDescription>
            {store ? 'Modifica los detalles de esta tienda.' : 'Crea una nueva tienda cliente.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            {/* Información Básica */}
            <h4 className="font-medium text-sm text-muted-foreground">Información Básica</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contactName" render={({ field }) => (
                <FormItem><FormLabel>Contacto*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email*</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Teléfono*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Dirección*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="logo" render={({ field }) => (
              <FormItem><FormLabel>Logo (URL)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Separator />

            {/* Tarifas */}
            <h4 className="font-medium text-sm text-muted-foreground">Tarifas</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="ratesFreight" render={({ field }) => (
                <FormItem><FormLabel>Flete</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ratesFulfillment" render={({ field }) => (
                <FormItem><FormLabel>Fulfillment</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ratesServiceFee" render={({ field }) => (
                <FormItem><FormLabel>Tarifa de Servicio</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <Separator />

            {/* Factores de No Efectividad */}
            <h4 className="font-medium text-sm text-muted-foreground">Factores de No Efectividad</h4>
            <p className="text-xs text-muted-foreground">Devoluciones</p>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="returnFreightPercent" render={({ field }) => (
                <FormItem><FormLabel>% Flete</FormLabel><FormControl><Input type="number" step="1" min="0" max="100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="returnFulfillmentPercent" render={({ field }) => (
                <FormItem><FormLabel>% Fulfillment</FormLabel><FormControl><Input type="number" step="1" min="0" max="100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="returnServiceFeePercent" render={({ field }) => (
                <FormItem><FormLabel>% Tarifa Servicio</FormLabel><FormControl><Input type="number" step="1" min="0" max="100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <p className="text-xs text-muted-foreground">Cancelaciones</p>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="cancelledFreightPercent" render={({ field }) => (
                <FormItem><FormLabel>% Flete</FormLabel><FormControl><Input type="number" step="1" min="0" max="100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cancelledFulfillmentPercent" render={({ field }) => (
                <FormItem><FormLabel>% Fulfillment</FormLabel><FormControl><Input type="number" step="1" min="0" max="100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cancelledServiceFeePercent" render={({ field }) => (
                <FormItem><FormLabel>% Tarifa Servicio</FormLabel><FormControl><Input type="number" step="1" min="0" max="100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            {store && (
              <>
                <Separator />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="inactive">Inactiva</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {store ? 'Guardar Cambios' : 'Crear Tienda'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
