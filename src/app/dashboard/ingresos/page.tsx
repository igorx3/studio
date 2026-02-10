import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function IngresosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos</CardTitle>
        <CardDescription>
          Aquí se mostrarán los reportes de ingresos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta página está en construcción.</p>
      </CardContent>
    </Card>
  );
}
