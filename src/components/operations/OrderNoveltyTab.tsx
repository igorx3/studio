'use client';

import React from 'react';
import type { Order, OrderEvent } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, Pencil, Ban } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface OrderNoveltyTabProps {
  order: Order;
}

const NoveltyTimelineItem = ({ novelty }: { novelty: OrderEvent }) => (
    <div className="relative pl-8">
        <div className="absolute left-0 top-0 flex h-full w-8 justify-center">
            <div className="h-full w-px bg-border"></div>
            <div className="absolute top-1 z-10 h-4 w-4 rounded-full bg-primary"></div>
        </div>
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-base">Novedad reportada por {novelty.user.name}</CardTitle>
                <CardDescription>{new Date(novelty.createdAt).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {novelty.photoUrl && (
                     <a href={novelty.photoUrl} target="_blank" rel="noopener noreferrer">
                        <img src={novelty.photoUrl} alt="Prueba de novedad" className="rounded-md border max-h-60" />
                    </a>
                )}
                <blockquote className="border-l-2 pl-4 italic text-muted-foreground">"{novelty.comment}"</blockquote>
            </CardContent>
        </Card>
    </div>
)

export default function OrderNoveltyTab({ order }: OrderNoveltyTabProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';
  
  const noveltyEvents = order.history?.filter(h => h.to === 'Novedad').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  const isNoveltyActive = order.status === 'Novedad';

  if (noveltyEvents.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-center">
        <p className="text-muted-foreground">No hay novedades registradas para este pedido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(isClient || isAdmin) && isNoveltyActive && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Acción Requerida: Resolver Novedad</CardTitle>
            <CardDescription>Por favor, selecciona una opción para continuar con el pedido.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Button variant="outline"><Calendar className="mr-2 h-4 w-4" />Reprogramar Entrega</Button>
            <Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Cambiar Datos de Entrega</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive"><Ban className="mr-2 h-4 w-4" />Cancelar Pedido</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmas la cancelación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El pedido se marcará como cancelado y se aplicarán los costos correspondientes. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Confirmar Cancelación</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

        <div>
            <h3 className="text-lg font-semibold mb-4">Historial de Novedades</h3>
            <div className="space-y-4">
                {noveltyEvents.map(event => <NoveltyTimelineItem key={event.id} novelty={event} />)}
            </div>
        </div>
    </div>
  )
}
