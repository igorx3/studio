'use client';

import React from 'react';
import type { Order } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { Printer, Copy, Ban } from 'lucide-react';
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
import OrderDetailsTab from './OrderDetailsTab';
import OrderCommentsTab from './OrderCommentsTab';
import OrderTimelineTab from './OrderTimelineTab';
import OrderNoveltyTab from './OrderNoveltyTab';

interface OrderDetailDialogProps {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onOrderUpdate: (order: Order) => void;
  onDuplicateOrder: (order: Order) => void;
}

export default function OrderDetailDialog({ order, onOpenChange, onOrderUpdate, onDuplicateOrder }: OrderDetailDialogProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';
  const isOpen = order !== null;

  if (!order) {
    return null;
  }

  const handleAnular = () => {
    const now = new Date().toISOString();
    const historyEntry = {
      id: `hist-${Date.now()}`,
      eventType: 'Status Change' as const,
      user: { name: user?.name || 'Usuario' },
      createdAt: now,
      from: order.status,
      to: 'Anulado',
    };
    onOrderUpdate({
      ...order,
      status: 'Anulado',
      previousStatus: order.status,
      history: [...(order.history || []), historyEntry],
      updatedAt: now,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
          <Tabs defaultValue="details" className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-6 pb-0 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">Orden {order.externalOrderReference}</DialogTitle>
                  <DialogDescription>
                    Detalles, comentarios e historial del pedido.
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir Label
                    </Button>

                    {(isClient || isAdmin) && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={order.status !== 'Generado'}>
                              <Ban className="mr-2 h-4 w-4" />
                              Anular Pedido
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro que deseas anular este pedido?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleAnular} className="bg-destructive hover:bg-destructive/90">Confirmar Anulación</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button variant="outline" size="sm" onClick={() => onDuplicateOrder(order)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar Pedido
                        </Button>
                      </>
                    )}
                </div>
              </div>
              <TabsList className="grid w-full grid-cols-4 mt-4">
                <TabsTrigger value="details">Detalle</TabsTrigger>
                <TabsTrigger value="comments">Comentarios</TabsTrigger>
                <TabsTrigger value="novelty">Gestión de Novedades</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>
            </DialogHeader>

            <div className="p-6 overflow-y-auto flex-1">
              <TabsContent value="details" className="mt-0">
                <OrderDetailsTab order={order} onOrderUpdate={onOrderUpdate} />
              </TabsContent>
              <TabsContent value="comments" className="mt-0">
                <OrderCommentsTab order={order} onOrderUpdate={onOrderUpdate} />
              </TabsContent>
              <TabsContent value="novelty" className="mt-0">
                <OrderNoveltyTab order={order} onOrderUpdate={onOrderUpdate} />
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <OrderTimelineTab order={order} />
              </TabsContent>
            </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
