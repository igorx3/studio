"use client";

import { useMemo } from "react";
import { mockOrders } from "@/lib/data";
import type { Order } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Recipient {
  phone: string;
  name: string;
  orderCount: number;
  lastOrderDate: string;
}

export function DestinatariosList() {
  const recipients = useMemo(() => {
    const recipientMap = new Map<string, Recipient>();

    mockOrders.forEach((order) => {
      if (!order.recipientPhone) return;

      if (recipientMap.has(order.recipientPhone)) {
        const existing = recipientMap.get(order.recipientPhone)!;
        existing.orderCount++;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        recipientMap.set(order.recipientPhone, {
          phone: order.recipientPhone,
          name: order.recipientName,
          orderCount: 1,
          lastOrderDate: order.createdAt,
        });
      }
    });

    return Array.from(recipientMap.values()).sort((a, b) => b.orderCount - a.orderCount);
  }, []);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Teléfono (ID)</TableHead>
          <TableHead className="text-center">Pedidos Recibidos</TableHead>
          <TableHead>Último Pedido</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipients.map((recipient) => (
          <TableRow key={recipient.phone}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(recipient.name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{recipient.name}</span>
              </div>
            </TableCell>
            <TableCell>{recipient.phone}</TableCell>
            <TableCell className="text-center">{recipient.orderCount}</TableCell>
            <TableCell>{new Date(recipient.lastOrderDate).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
