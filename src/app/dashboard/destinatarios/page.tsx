import { DestinatariosList } from "@/components/dashboard/destinatarios-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DestinatariosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Destinatarios</CardTitle>
        <CardDescription>
          Lista de todos los destinatarios (clientes finales) registrados en el sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DestinatariosList />
      </CardContent>
    </Card>
  );
}
