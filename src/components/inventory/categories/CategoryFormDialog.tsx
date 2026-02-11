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
import { Loader2 } from 'lucide-react';
import type { ArticleCategory } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { FirebaseContext } from '@/firebase/context';
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type FormData = z.infer<typeof formSchema>;

export function CategoryFormDialog({ isOpen, onOpenChange, category }: { isOpen: boolean, onOpenChange: (open: boolean) => void, category?: ArticleCategory | null }) {
  const { user } = useAuth();
  const { firestore } = useContext(FirebaseContext);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    if (isOpen) {
      if (category) {
        form.reset({
          name: category.name,
          description: category.description,
          status: category.status,
        });
      } else {
        form.reset({ name: '', description: '', status: 'active' });
      }
    }
  }, [category, isOpen, form]);

  const onSubmit = async (values: FormData) => {
    if (!firestore || !user) return;
    setIsSubmitting(true);
    
    try {
      if (category) {
        // Update existing category
        const catRef = doc(firestore, 'articleCategories', category.id);
        await updateDoc(catRef, { ...values, updatedAt: serverTimestamp() });
        toast({ title: "Categoría Actualizada", description: `${values.name} ha sido guardada.` });
      } else {
        // Create new category
        const collectionRef = collection(firestore, 'articleCategories');
        await addDoc(collectionRef, {
          ...values,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Categoría Creada", description: `${values.name} ha sido agregada.` });
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo guardar la categoría." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          <DialogDescription>
            {category ? 'Modifica los detalles de esta categoría.' : 'Crea una nueva categoría para tus artículos.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
            )} />
            {category && (
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
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? 'Guardar Cambios' : 'Crear Categoría'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
