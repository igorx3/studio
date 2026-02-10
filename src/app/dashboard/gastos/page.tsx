import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function GastosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos</CardTitle>
        <CardDescription>
          Aquí se mostrarán los reportes de gastos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta página está en construcción.</p>
      </CardContent>
    </Card>
  );
}
