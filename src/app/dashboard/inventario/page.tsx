import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function InventarioPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="grid gap-2">
                <CardTitle>Gestión de Inventario</CardTitle>
                <CardDescription>
                Administra los productos de tus tiendas almacenados en tu centro.
                </CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Producto
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">La lista de productos en inventario se mostrará aquí.</p>
        </div>
      </CardContent>
    </Card>
  );
}
