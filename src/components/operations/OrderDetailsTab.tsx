import React from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CreateNoveltyDialog } from './CreateNoveltyDialog';

interface OrderDetailsTabProps {
  order: Order;
}

const allStatuses: OrderStatus[] = [
  'Generado', 'Confirmado', 'Confirmado para la tarde', 'Pendiente Respuesta', 'Novedad', 'Entregado',
  'En Ruta', 'Enviado', 'Cancelado', 'Devolución', 'No Contesta', 'Sin Cobertura', 'Indemnización', 'Anulado'
];


const DetailItem = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <div className="flex flex-col">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium">{value || 'N/A'}</div>
    </div>
);

const ProductsTable = ({ products }: { products: { itemId: string; name: string; sku: string; quantity: number; price: number; }[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Valor Declarado</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {products.map(p => (
                <TableRow key={p.itemId}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell className="text-center">{p.quantity}</TableCell>
                    <TableCell className="text-right">${p.price.toLocaleString()}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)

export default function OrderDetailsTab({ order }: OrderDetailsTabProps) {
  const { user } = useAuth();
  const isClient = user?.role === 'client';
  const [currentStatus, setCurrentStatus] = React.useState<OrderStatus>(order.status);
  const [isNoveltyDialogOpen, setIsNoveltyDialogOpen] = React.useState(false);
  
  // Rule: 'Generado' status cannot be re-selected once changed.
  const isStatusGenerated = order.history?.some(h => h.from === 'Generado' && h.to !== 'Generado') ?? (order.status !== 'Generado');

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === 'Novedad' && !isClient) {
        setIsNoveltyDialogOpen(true);
    } else {
        setCurrentStatus(newStatus);
        // API call to update status would go here
    }
  }

  const handleNoveltySubmit = ({ comment, photo }: { comment: string, photo: File }) => {
    console.log("Submitting novelty:", { comment, photo });
    setCurrentStatus('Novedad');
    // API call to update status with novelty data would go here
    setIsNoveltyDialogOpen(false);
  }

  return (
    <>
    <CreateNoveltyDialog 
        isOpen={isNoveltyDialogOpen} 
        onOpenChange={setIsNoveltyDialogOpen}
        onSubmit={handleNoveltySubmit}
    />
    <Card>
        <CardContent className="space-y-6 pt-6">
            {/* Información del Pedido */}
            <div>
                <h4 className="font-semibold mb-4 text-lg">Información del Pedido</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <DetailItem label="Tracking ID" value={order.externalOrderReference} />
                    <DetailItem label="Fecha de Creación" value={new Date(order.createdAt).toLocaleString()} />
                    <DetailItem label="Tienda (Cliente)" value={order.client} />
                    <div className="flex flex-col">
                        <p className="text-sm text-muted-foreground">Estado</p>
                        {isClient ? (
                             <Badge className="mt-1 w-fit">{currentStatus}</Badge>
                        ) : (
                            <Select value={currentStatus} onValueChange={(v) => handleStatusChange(v as OrderStatus)}>
                                <SelectTrigger className="w-[180px] mt-1">
                                    <SelectValue placeholder="Cambiar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allStatuses.map(status => (
                                        <SelectItem 
                                            key={status} 
                                            value={status} 
                                            disabled={status === 'Generado' && isStatusGenerated}
                                        >
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <DetailItem label="Mensajero Asignado" value={order.assignedCourierName} />
                    <DetailItem label="Tipo de Pago" value={order.paymentType} />
                    <DetailItem label="Tipo de Servicio" value={<Badge variant="outline">{order.serviceType}</Badge>} />
                    {order.thirdPartyCarrier && <DetailItem label="Transportadora" value={order.thirdPartyCarrier} />}
                    {order.pickupAddress && <DetailItem label="Dirección de Recogida" value={order.pickupAddress.address} />}
                </div>
            </div>

            <Separator />
            
            {/* Destinatario */}
            <div>
                <h4 className="font-semibold mb-4 text-lg">Destinatario</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <DetailItem label="Nombre" value={order.recipientName} />
                    <DetailItem label="Teléfono" value={order.recipientPhone} />
                    <DetailItem label="Ciudad" value={order.deliveryAddress?.city} />
                    <DetailItem label="Sector" value={order.deliveryAddress?.sector} />
                    <DetailItem label="Dirección" value={order.deliveryAddress?.addressLine1} />
                </div>
            </div>

            <Separator />

            {/* Productos */}
             <div>
                <h4 className="font-semibold mb-4 text-lg">Productos</h4>
                <ProductsTable products={order.products} />
            </div>

            <Separator />

            {/* Financiero */}
            <div>
                <h4 className="font-semibold mb-4 text-lg">Financiero</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
                    <DetailItem label="Monto COD" value={`$${order.financials?.codAmount.toLocaleString()}`} />
                    {!isClient && <DetailItem label="Cobrado a Mensajero" value={<Badge variant={order.financials?.collectedFromCourier ? 'default' : 'destructive'}>{order.financials?.collectedFromCourier ? 'Sí' : 'No'}</Badge>} />}
                    <div className="col-span-2 md:col-span-2 bg-muted p-4 rounded-lg">
                        <p className="font-semibold mb-2">Desglose de Costos</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>Flete:</span> <span>${order.financials?.freightCost.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Fulfillment:</span> <span>${order.financials?.fulfillmentCost.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Tarifa de Servicio:</span> <span>${order.financials?.serviceFee.toLocaleString()}</span></div>
                            <Separator className="my-2 bg-border" />
                            <div className="flex justify-between font-bold"><span>Total Costos:</span> <span>${order.financials?.totalCost.toLocaleString()}</span></div>
                        </div>
                        <Separator className="my-3 bg-border" />
                         <div className="flex justify-between font-bold text-primary text-base">
                            <span>Neto a Liquidar:</span>
                            <span>${order.financials?.netToLiquidate.toLocaleString()}</span>
                         </div>
                    </div>
                </div>
            </div>

             <Separator />

            {/* Almacén */}
            <div>
                <h4 className="font-semibold mb-4 text-lg">Almacén</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <DetailItem label="Estado de Empaque" value={order.estadoDeEmpaque} />
                    <DetailItem label="Ubicación Principal" value={order.location} />
                    {!isClient && <DetailItem label="Sub-Ubicación" value={order.subLocation} />}
                </div>
            </div>
            
        </CardContent>
    </Card>
    </>
  );
}
