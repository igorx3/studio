'use client';

import React, { useState, useMemo } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, RefreshCw, MoreHorizontal } from "lucide-react";
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';

interface OrdersListProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

const statusVariant: { [key in OrderStatus]?: "default" | "secondary" | "outline" | "destructive" } = {
  'Generado': 'outline',
  'Confirmado': 'default',
  'Confirmado para la tarde': 'default',
  'Coordinado': 'default',
  'En Ruta': 'secondary',
  'En tránsito': 'secondary',
  'Entregado': 'default',
  'Novedad': 'destructive',
  'Pendiente Respuesta': 'outline',
  'Llamar': 'outline',
  'Reprogramado': 'outline',
  'Cancelado': 'destructive',
  'Anulado': 'destructive',
  'Devolución': 'destructive',
  'ENVIADO': 'outline',
  'En almacén': 'outline',
};

function parseCreatedAt(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date.getTime();
    }
    return 0;
}

function sortByCreatedAtDesc(orders: Order[]): Order[] {
    return [...orders].sort((a, b) => {
        const ta = parseCreatedAt(a.createdAt);
        const tb = parseCreatedAt(b.createdAt);

        if (tb !== ta) return tb - ta;

        const refA = a.externalOrderReference || a.id;
        const refB = b.externalOrderReference || b.id;

        if (refA < refB) return 1;
        if (refA > refB) return -1;
        
        return b.id.localeCompare(a.id);
    });
}

const PAGE_SIZE = 15;

export function OrdersList({ orders, onOrderClick }: OrdersListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const sortedOrders = useMemo(() => sortByCreatedAtDesc(orders), [orders]);

    const filteredOrders = useMemo(() => {
        if (!searchTerm) return sortedOrders;
        const lowercasedFilter = searchTerm.toLowerCase();
        return sortedOrders.filter(order =>
            (order.externalOrderReference?.toLowerCase().includes(lowercasedFilter)) ||
            (order.client.toLowerCase().includes(lowercasedFilter)) ||
            (order.recipientName.toLowerCase().includes(lowercasedFilter)) ||
            (order.recipientPhone?.toLowerCase().includes(lowercasedFilter))
        );
    }, [sortedOrders, searchTerm]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por tracking, cliente, destinatario..." 
                    className="pl-10 bg-background" 
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <Card className="flex flex-col h-[calc(100vh-20rem)]">
          <div className="flex-grow overflow-y-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead className="w-[50px]"><Checkbox /></TableHead>
                        <TableHead>Tracking ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Destinatario</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Mensajero</TableHead>
                        <TableHead className="text-right">COD</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedOrders.length > 0 ? (
                        paginatedOrders.map(order => (
                            <TableRow key={order.id} onClick={() => onOrderClick(order)} className="cursor-pointer">
                                <TableCell onClick={(e) => e.stopPropagation()}><Checkbox /></TableCell>
                                <TableCell className="font-medium">{order.externalOrderReference || order.id}</TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{order.client}</TableCell>
                                <TableCell>{order.recipientName}</TableCell>
                                <TableCell>{order.recipientPhone}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[order.status] || 'secondary'}>{order.status}</Badge>
                                </TableCell>
                                <TableCell>{order.assignedCourierName || 'N/A'}</TableCell>
                                <TableCell className="text-right font-medium">${order.cashOnDeliveryAmount?.toLocaleString() || '0.00'}</TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => onOrderClick(order)}>Ver Detalles</DropdownMenuItem>
                                        <DropdownMenuItem>Cambiar Estado</DropdownMenuItem>
                                        <DropdownMenuItem>Imprimir Etiqueta</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center h-24 text-muted-foreground">
                                No se encontraron pedidos.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedOrders.length} de {filteredOrders.length} pedidos
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
                    <span className="text-sm">{currentPage} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</Button>
                </div>
            </div>
        </Card>
    </div>
  );
}
