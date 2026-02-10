import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";


export default function ClientPortalPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Portal de Cliente</h2>
                <p className="text-muted-foreground">Gestiona tus pedidos y tu cuenta.</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Nuevo Pedido
            </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Balance de Billetera</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">$5,000.00</p>
                    <Button variant="outline" size="sm" className="mt-2">Recargar</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Pedidos Activos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">5</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Pedidos Completados</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">128</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Mis Pedidos Recientes</CardTitle>
                <CardDescription>
                Un resumen de tus envíos más recientes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">La tabla con tus pedidos recientes aparecerá aquí.</p>
            </CardContent>
        </Card>
    </div>
  );
}
