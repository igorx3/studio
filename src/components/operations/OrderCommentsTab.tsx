'use client';

import React, { useState } from 'react';
import type { Order, OrderComment } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Paperclip } from 'lucide-react';

interface OrderCommentsTabProps {
  order: Order;
  onOrderUpdate: (order: Order) => void;
}

const commentSchema = z.object({
  comment: z.string().min(1, 'El comentario no puede estar vacío.'),
  files: z.any().optional(),
});

function readFilesAsDataURLs(files: FileList): Promise<string[]> {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    )
  );
}

const Comment = ({ comment, onImageClick }: { comment: OrderComment; onImageClick: (src: string) => void }) => {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="flex gap-4">
            <Avatar>
                <AvatarImage src={comment.user.avatarUrl} />
                <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{comment.user.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-sm mt-1">{comment.text}</p>
                {comment.photos && comment.photos.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {comment.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`attachment ${index+1}`}
                              className="h-20 w-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => onImageClick(photo)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function OrderCommentsTab({ order, onOrderUpdate }: OrderCommentsTabProps) {
  const { user } = useAuth();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  const onSubmit = async (values: z.infer<typeof commentSchema>) => {
    const now = new Date().toISOString();
    let photos: string[] | undefined;
    if (values.files && values.files.length > 0) {
      photos = await readFilesAsDataURLs(values.files);
    }
    const newComment: OrderComment = {
      id: `comment-${Date.now()}`,
      userName: user?.name || 'Usuario',
      user: { name: user?.name || 'Usuario', avatarUrl: user?.avatarUrl ?? undefined },
      createdAt: now,
      text: values.comment,
      photos,
    };
    onOrderUpdate({
      ...order,
      comments: [...(order.comments || []), newComment],
      updatedAt: now,
    });
    form.reset();
  };

  return (
    <div className="space-y-6">
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {previewImage && (
            <img src={previewImage} alt="Vista previa" className="w-full h-auto rounded-md" />
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
            <CardTitle className='text-lg'>Agregar Comentario</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                    <FormItem>
                        <Label>Comentario</Label>
                        <FormControl>
                        <Textarea placeholder="Escribe un comentario..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="files"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                        <Label>Fotos (opcional)</Label>
                        <FormControl>
                            <div className="relative">
                                <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="file"
                                  multiple
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
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Agregar Comentario</Button>
                </form>
            </Form>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Comentarios Anteriores</h3>
        <div className="space-y-6">
          {order.comments && order.comments.length > 0 ? (
            order.comments.map((comment) => <Comment key={comment.id} comment={comment} onImageClick={setPreviewImage} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay comentarios aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}
