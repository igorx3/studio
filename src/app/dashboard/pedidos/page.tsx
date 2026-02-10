import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Plus, 
    MoreHorizontal, 
    FileDown, 
    Upload, 
    Download,
    Search,
    Filter,
    RefreshCw
} from "lucide-react";
import { mockOrders } from "@/lib/data";
import type { Order } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const statusVariant: { [key in Order['status']]: "default" | "secondary" | "outline" | "destructive" } = {
  'Confirmado': 'default',
  'Entregado': 'default',
  'En tránsito': 'secondary',
  'En almacén': 'outline',
  'Pendiente': 'outline',
  'Cancelado': 'destructive',
  'Nuevo': 'outline',
  'Novedad': 'destructive',
};


export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4"/>
                    Plantilla
                </Button>
                <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4"/>
                    Carga Masiva
                </Button>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4"/>
                    Exportar
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    <Plus className="mr-2 h-4 w-4"/>
                    Nuevo Pedido
                </Button>
            </div>
        </div>

        <Tabs defaultValue="confirmados" className="w-full">
            <TabsList>
                <TabsTrigger value="nuevos">Nuevos</TabsTrigger>
                <TabsTrigger value="confirmados">Confirmados</TabsTrigger>
                <TabsTrigger value="novedad">Novedad</TabsTrigger>
                <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
            <TabsContent value="confirmados" className="mt-4">
                <Card>
                    <CardHeader>
                        <Tabs defaultValue="lista" className="w-full">
                            <div className="flex justify-between items-center">
                                <TabsList className="grid w-full grid-cols-2 max-w-sm">
                                    <TabsTrigger value="lista">Lista de Pedidos</TabsTrigger>
                                    <TabsTrigger value="borradores">Borradores <Badge variant="secondary" className="ml-2">20</Badge></TabsTrigger>
                                </TabsList>
                            </div>
                             <TabsContent value="lista" className="mt-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="relative w-full max-w-sm">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Buscar por tracking ID, cliente, destinatario..." className="pl-10 bg-background" />
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
                             </TabsContent>
                        </Tabs>

                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Tracking ID</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Destinatario</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Tipo Pago</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>COD</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                    No hay pedidos disponibles
                                </TableCell>
                            </TableRow>
                        </TableBody>
                        </Table>
                    </CardContent>
                    <div className="flex items-center justify-between p-4 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                            Mostrando 0 - 0 de 0 pedidos
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" disabled>Anterior</Button>
                             <Button variant="outline" size="sm" disabled>Siguiente</Button>
                        </div>
                    </div>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
