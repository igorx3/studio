'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Paperclip } from 'lucide-react';

interface CreateNoveltyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { comment: string, photo: File }) => void;
}

const noveltySchema = z.object({
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres.'),
  photo: z.any().refine(files => files?.length === 1, 'Debes adjuntar una foto de comprobación.'),
});

export function CreateNoveltyDialog({ isOpen, onOpenChange, onSubmit }: CreateNoveltyDialogProps) {
  const form = useForm<z.infer<typeof noveltySchema>>({
    resolver: zodResolver(noveltySchema),
    defaultValues: { comment: '' },
  });

  const handleSubmit = (values: z.infer<typeof noveltySchema>) => {
    onSubmit({ comment: values.comment, photo: values.photo[0] });
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Novedad</DialogTitle>
          <DialogDescription>
            Para cambiar el estado a "Novedad", debes proporcionar un comentario explicativo y una foto de evidencia.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario Explicativo (Obligatorio)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Dirección no encontrada, el cliente no contesta..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Foto de Comprobación (Obligatorio)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="pl-10" 
                        onChange={(e) => onChange(e.target.files)}
                        {...fieldProps}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Guardar Novedad</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
