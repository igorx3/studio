import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function UbicacionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación</CardTitle>
        <CardDescription>
          Aquí se mostrará la ubicación en tiempo real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta página está en construcción.</p>
      </CardContent>
    </Card>
  );
}
