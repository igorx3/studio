import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Wallet, BarChart } from "lucide-react";

const summaryCards = [
  { title: "Pedidos del Día", value: "125", icon: Package, change: "+15%" },
  { title: "Mensajeros Activos", value: "12", icon: Truck, change: "+2" },
  { title: "Ingresos (Hoy)", value: "$2,540", icon: Wallet, change: "+8%" },
  { title: "Tasa de Entrega", value: "98.2%", icon: BarChart, change: "-0.5%" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resumen General</h2>
        <p className="text-muted-foreground">Una vista rápida del rendimiento de hoy.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.change} vs ayer
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aún no hay actividad reciente para mostrar.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Mensajeros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Datos de rendimiento no disponibles.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
