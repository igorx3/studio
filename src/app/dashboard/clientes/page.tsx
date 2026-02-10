import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ClientesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>
          Aquí se gestionarán los clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta página está en construcción.</p>
      </CardContent>
    </Card>
  );
}
