import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RouteOptimizer } from "@/components/dashboard/route-optimizer";

export default function OptimizeRoutesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Herramienta de Optimización de Rutas (IA)</CardTitle>
        <CardDescription>
          Usa inteligencia artificial para calcular las rutas de entrega más eficientes para tus mensajeros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RouteOptimizer />
      </CardContent>
    </Card>
  );
}
