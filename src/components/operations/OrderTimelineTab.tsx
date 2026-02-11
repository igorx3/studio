'use client';

import React from 'react';
import type { Order, OrderEvent } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Package, MapPin } from 'lucide-react';

interface OrderTimelineTabProps {
  order: Order;
}

const TimelineItem = ({ event, isOpsUser }: { event: OrderEvent, isOpsUser: boolean }) => {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                    {event.eventType === 'Status Change' ? <Package className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                </div>
                <div className="w-px h-full bg-border"></div>
            </div>
            <div className="pb-8 flex-1">
                <p className="text-sm text-muted-foreground">{new Date(event.createdAt).toLocaleString()} por {event.user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">{event.from}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-primary">{event.to}</span>
                </div>
                {event.eventType === 'Location Change' && isOpsUser && event.subLocation && (
                     <p className="text-xs text-muted-foreground mt-1">Sub-ubicación: {event.subLocation}</p>
                )}
                {event.comment && (
                    <p className="text-sm text-muted-foreground mt-1 italic">"{event.comment}"</p>
                )}
                 {event.photoUrl && (
                    <a href={event.photoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                        <img src={event.photoUrl} alt="Prueba de evento" className="h-24 w-24 object-cover rounded-md border" />
                    </a>
                )}
            </div>
        </div>
    )
}

export default function OrderTimelineTab({ order }: OrderTimelineTabProps) {
  const { user } = useAuth();
  const isOpsUser = user?.role === 'admin' || user?.role === 'operations' || user?.role === 'warehouse';

  const statusHistory = order.history?.filter(h => h.eventType === 'Status Change') || [];
  const locationHistory = order.history?.filter(h => h.eventType === 'Location Change') || [];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cambios de Estado</CardTitle>
        </CardHeader>
        <CardContent>
          {statusHistory.length > 0 ? (
            <div className="relative">
              {statusHistory.map((event) => <TimelineItem key={event.id} event={event} isOpsUser={isOpsUser} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay cambios de estado.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Movimientos de Ubicación</CardTitle>
        </CardHeader>
        <CardContent>
          {locationHistory.length > 0 ? (
            <div className="relative">
              {locationHistory.map((event) => <TimelineItem key={event.id} event={event} isOpsUser={isOpsUser} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay movimientos de ubicación.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
