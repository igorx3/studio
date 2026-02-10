import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CouriersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Mensajeros</CardTitle>
        <CardDescription>
          Asigna tareas, visualiza rutas y monitorea el rendimiento de tus mensajeros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">La funcionalidad de gestión de mensajeros estará disponible aquí.</p>
      </CardContent>
    </Card>
  );
}
