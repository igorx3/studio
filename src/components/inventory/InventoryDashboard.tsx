import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Archive, AlertTriangle, Clock, Sigma } from "lucide-react";

const kpiCards = [
  { title: "Valor Total del Inventario", value: "$1,250,340", icon: Sigma },
  { title: "Total de Artículos (SKUs)", value: "582", icon: Package },
  { title: "Total de Unidades", value: "12,890", icon: Archive },
  { title: "Artículos con Stock Bajo", value: "32", icon: AlertTriangle, color: "text-primary" },
  { title: "Artículos Agotados", value: "15", icon: AlertTriangle, color: "text-destructive" },
  { title: "Próximos a Vencer", value: "8", icon: Clock, color: "text-orange-500" },
];

export function InventoryDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {kpiCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 text-muted-foreground ${card.color || ''}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
