import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { mockOrders } from "@/lib/data";
import type { Order } from "@/lib/types";
import Link from "next/link";

const statusVariant: { [key in Order['status']]: "default" | "secondary" | "outline" | "destructive" } = {
  'Entregado': 'default',
  'En tránsito': 'secondary',
  'En almacén': 'outline',
  'Pendiente': 'outline',
  'Cancelado': 'destructive',
};

function WhatsAppIcon() {
    return (
      <svg
        className="h-4 w-4"
        aria-hidden="true"
        role="img"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 1024 1024"
      >
        <path
          fill="currentColor"
          d="M718.5 730.4c-8.2-3.9-48.7-23.9-56.2-26.6c-7.5-2.7-13-4.1-18.4 4.1c-5.5 8.2-21.3 26.6-26.1 32c-4.8 5.5-9.7 6.1-17.9 2.1c-8.2-4.1-34.8-12.8-66.3-41c-24.5-22-41-49.2-45.8-57.4c-4.8-8.2-0.5-12.8 3.6-16.9c3.6-3.6 8.2-9.4 12.3-14.2c4.1-4.8 5.5-8.2 8.2-13.7c2.7-5.5 1.4-10.2-1.4-14.2c-2.7-4.1-18.4-44.2-25.4-60.6c-6.7-16.1-13.5-13.7-18.4-13.7c-4.6 0-9.7-0.5-14.7-0.5c-5.1 0-13.2 2.1-20.2 10c-7 8.2-26.9 26.1-26.9 63.8c0 37.7 27.5 74 31.3 79.2c3.8 5.1 54.1 82.5 132.9 116.5c18.4 8.2 34.3 13.2 46 17c18.1 5.9 34.8 5.1 48.1 3c14.2-2.1 48.7-19.8 55.6-39.1c6.9-19.3 6.9-35.8 4.8-39.1c-2.1-3.3-7.5-5.2-15.7-9.3z"
        />
        <path
          fill="currentColor"
          d="M859.3 164.7C763.2 68.6 624.1 24 480 24C214.9 24 0 238.9 0 504c0 85.3 22.4 168.3 66.1 240.6l-67.5 248.3l254.2-66.1c70.1 39 148.8 59.8 227.2 59.8h.1c265.1 0 480-214.9 480-480c0-144.1-44.6-283.2-140.7-379.3zM480 917.1c-72.2 0-142.6-18.9-204.4-54.5l-14.5-8.6l-152 39.4l40.1-148.2l-9.5-15.2c-39.2-62.9-60.2-135.2-60.2-210.1c0-220.6 179.4-400 400-400s400 179.4 400 400c0 220.6-179.4 400-400 400z"
        />
      </svg>
    );
}

export default function OrdersPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>Visualiza y gestiona todos tus pedidos.</CardDescription>
        </div>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Pedido
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Destinatario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.client}</TableCell>
                <TableCell>{order.recipient}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                            <DropdownMenuItem>Actualizar estado</DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`https://wa.me/${order.phone}`} target="_blank" rel="noopener noreferrer">
                                    <WhatsAppIcon /> <span className="ml-2">Contactar</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
