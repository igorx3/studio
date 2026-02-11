'use client';

import React from 'react';
import type { Order } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { Printer, X } from 'lucide-react';
import OrderDetailsTab from './OrderDetailsTab';
import OrderCommentsTab from './OrderCommentsTab';
import OrderTimelineTab from './OrderTimelineTab';

interface OrderDetailDialogProps {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
}

export default function OrderDetailDialog({ order, onOpenChange }: OrderDetailDialogProps) {
  const isOpen = order !== null;

  if (!order) {
    return null;
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
                    <DialogClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogClose>
                </div>
              </div>
              <TabsList className="grid w-full grid-cols-3 mt-4">
                <TabsTrigger value="details">Detalle</TabsTrigger>
                <TabsTrigger value="comments">Comentarios</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>
            </DialogHeader>

            <div className="p-6 overflow-y-auto flex-1">
              <TabsContent value="details" className="mt-0">
                <OrderDetailsTab order={order} />
              </TabsContent>
              <TabsContent value="comments" className="mt-0">
                <OrderCommentsTab order={order} />
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
