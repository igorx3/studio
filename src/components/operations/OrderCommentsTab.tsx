'use client';

import React from 'react';
import type { Order, OrderComment } from '@/lib/types';
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
import { Paperclip } from 'lucide-react';

interface OrderCommentsTabProps {
  order: Order;
}

const commentSchema = z.object({
  comment: z.string().min(1, 'El comentario no puede estar vacío.'),
  files: z.any().optional(),
});

const Comment = ({ comment }: { comment: OrderComment }) => {
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
                            <a key={index} href={photo} target="_blank" rel="noopener noreferrer">
                                <img src={photo} alt={`attachment ${index+1}`} className="h-20 w-20 object-cover rounded-md border" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function OrderCommentsTab({ order }: OrderCommentsTabProps) {
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  const onSubmit = (values: z.infer<typeof commentSchema>) => {
    console.log(values);
    // Here you would typically call an API to add the comment
    form.reset();
  };

  return (
    <div className="space-y-6">
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
                    render={({ field }) => (
                    <FormItem>
                        <Label>Fotos (opcional)</Label>
                        <FormControl>
                            <div className="relative">
                                <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="file" multiple className="pl-10" {...field} />
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
            order.comments.map((comment) => <Comment key={comment.id} comment={comment} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay comentarios aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}
