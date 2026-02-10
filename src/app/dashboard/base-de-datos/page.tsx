import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function DatabasePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database />
          Base de Datos
        </CardTitle>
        <CardDescription>
          Aquí podrás visualizar y gestionar los datos de tu aplicación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">Las herramientas para explorar y administrar la base de datos se mostrarán aquí.</p>
        </div>
      </CardContent>
    </Card>
  );
}
