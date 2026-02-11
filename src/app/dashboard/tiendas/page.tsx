import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function TiendasPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="grid gap-2">
                <CardTitle>Gestión de Tiendas</CardTitle>
                <CardDescription>
                Administra tus tiendas cliente, configura sus tarifas y reglas de negocio.
                </CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Tienda
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">La lista de tiendas y sus configuraciones se mostrarán aquí.</p>
        </div>
      </CardContent>
    </Card>
  );
}
