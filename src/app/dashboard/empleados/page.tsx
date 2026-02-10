import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function EmpleadosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Empleados</CardTitle>
        <CardDescription>
          Aquí se gestionarán los empleados de la empresa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta página está en construcción.</p>
      </CardContent>
    </Card>
  );
}
