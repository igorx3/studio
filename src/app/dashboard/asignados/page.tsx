import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AsignadosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignados</CardTitle>
        <CardDescription>
          Aquí se mostrarán los pedidos asignados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta página está en construcción.</p>
      </CardContent>
    </Card>
  );
}
