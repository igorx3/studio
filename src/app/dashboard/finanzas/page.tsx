import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FinancePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reconciliación Financiera</CardTitle>
        <CardDescription>
          Genera reportes de liquidación y reconcilia las finanzas de los mensajeros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Las herramientas de gestión financiera estarán disponibles aquí.</p>
      </CardContent>
    </Card>
  );
}
