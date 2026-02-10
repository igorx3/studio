'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import { optimizeDeliveryRoutes, OptimizeDeliveryRoutesOutput } from '@/ai/flows/optimize-delivery-routes';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  orderDetails: z.string().min(10, 'Por favor, proporciona detalles de los pedidos.'),
  courierLocations: z.string().min(5, 'Por favor, proporciona las ubicaciones de los mensajeros.'),
  trafficConditions: z.string().optional(),
});

export function RouteOptimizer() {
  const [isPending, startTransition] = useTransition();
  const [optimizationResult, setOptimizationResult] = useState<OptimizeDeliveryRoutesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderDetails: '',
      courierLocations: '',
      trafficConditions: 'Normal',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setOptimizationResult(null);
    startTransition(async () => {
      try {
        const result = await optimizeDeliveryRoutes(values);
        setOptimizationResult(result);
        toast({
          title: 'Rutas optimizadas',
          description: 'Las rutas de entrega se han calculado con éxito.',
        });
      } catch (error) {
        console.error('Error optimizing routes:', error);
        toast({
          variant: 'destructive',
          title: 'Error de optimización',
          description: 'No se pudieron optimizar las rutas. Por favor, inténtalo de nuevo.',
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="orderDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detalles de los Pedidos</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Pedido 1: Calle Sol #25, Santo Domingo. Pedido 2: Av. Luna #10, Santiago..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="courierLocations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicaciones de los Mensajeros</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Mensajero A: Zona Colonial. Mensajero B: Piantini..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Optimizar Rutas
          </Button>
        </form>
      </Form>

      {isPending && (
         <div className="space-y-4">
            <h3 className="text-lg font-semibold">Optimizando...</h3>
            <p className="text-muted-foreground">La IA está calculando las mejores rutas. Esto puede tomar un momento.</p>
            <div className="rounded-lg border p-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            </div>
         </div>
      )}

      {optimizationResult && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rutas Optimizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm font-mono">
                {optimizationResult.optimizedRoutes}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tiempos de Entrega Estimados</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm font-mono">
                {optimizationResult.estimatedDeliveryTimes}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
