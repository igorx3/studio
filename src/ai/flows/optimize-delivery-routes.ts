'use server';

/**
 * @fileOverview Optimizes delivery routes for couriers using AI, considering order details and courier locations.
 *
 * - optimizeDeliveryRoutes - A function that optimizes delivery routes.
 * - OptimizeDeliveryRoutesInput - The input type for the optimizeDeliveryRoutes function.
 * - OptimizeDeliveryRoutesOutput - The return type for the optimizeDeliveryRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeDeliveryRoutesInputSchema = z.object({
  orderDetails: z.string().describe('Details of the orders to be delivered, including delivery addresses and time windows.'),
  courierLocations: z.string().describe('Current locations of the couriers.'),
  trafficConditions: z.string().optional().describe('Current traffic conditions in the delivery area.'),
});
export type OptimizeDeliveryRoutesInput = z.infer<typeof OptimizeDeliveryRoutesInputSchema>;

const OptimizeDeliveryRoutesOutputSchema = z.object({
  optimizedRoutes: z.string().describe('Optimized delivery routes for each courier, including the order of deliveries.'),
  estimatedDeliveryTimes: z.string().describe('Estimated delivery times for each order based on the optimized routes.'),
});
export type OptimizeDeliveryRoutesOutput = z.infer<typeof OptimizeDeliveryRoutesOutputSchema>;

export async function optimizeDeliveryRoutes(input: OptimizeDeliveryRoutesInput): Promise<OptimizeDeliveryRoutesOutput> {
  return optimizeDeliveryRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeDeliveryRoutesPrompt',
  input: {schema: OptimizeDeliveryRoutesInputSchema},
  output: {schema: OptimizeDeliveryRoutesOutputSchema},
  prompt: `You are an expert logistics optimizer. Given the following order details, courier locations, and traffic conditions, please provide optimized delivery routes for each courier and estimated delivery times for each order.

Order Details: {{{orderDetails}}}
Courier Locations: {{{courierLocations}}}
Traffic Conditions: {{{trafficConditions}}}

Please provide the optimized routes and estimated delivery times in a clear and concise format.

Optimize the routes to minimize delivery times and maximize efficiency.`,
});

const optimizeDeliveryRoutesFlow = ai.defineFlow(
  {
    name: 'optimizeDeliveryRoutesFlow',
    inputSchema: OptimizeDeliveryRoutesInputSchema,
    outputSchema: OptimizeDeliveryRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
