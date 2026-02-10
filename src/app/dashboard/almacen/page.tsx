import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScanLine } from "lucide-react";

export default function WarehousePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Almacén</CardTitle>
        <CardDescription>
          Administra el inventario y actualiza el estado de los pedidos en el almacén.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button>
            <ScanLine className="mr-2 h-4 w-4" />
            Pistoleo Masivo (Escanear)
        </Button>
        <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">El estado del inventario y las herramientas de seguimiento de pedidos se mostrarán aquí.</p>
        </div>
      </CardContent>
    </Card>
  );
}
