import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function UsuariosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
        <CardDescription>
          Aquí se gestionarán los usuarios del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta página está en construcción.</p>
      </CardContent>
    </Card>
  );
}
