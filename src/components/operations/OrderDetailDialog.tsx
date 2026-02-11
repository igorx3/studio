'use client';

import React from 'react';
import type { Order } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl sm:max-w-2xl lg:max-w-3xl p-0">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">Orden {order.externalOrderReference}</SheetTitle>
              <SheetDescription>
                Detalles, comentarios e historial del pedido.
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Label
                </Button>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
            </div>
          </div>
        </SheetHeader>
        <div className="p-6">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalle</TabsTrigger>
                <TabsTrigger value="comments">Comentarios</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <OrderDetailsTab order={order} />
              </TabsContent>
              <TabsContent value="comments" className="mt-6">
                <OrderCommentsTab order={order} />
              </TabsContent>
              <TabsContent value="history" className="mt-6">
                <OrderTimelineTab order={order} />
              </TabsContent>
            </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
