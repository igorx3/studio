'use client';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { FirebaseContext } from '@/firebase/context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { InventoryItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PackagePlus } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ProductCard = ({ item }: { item: InventoryItem }) => {
    const dropshipping = item.dropshipping;
    if (!dropshipping) return null;

    const getAvailability = () => {
        if (item.stockAvailable <= 0) return { label: 'Agotado', variant: 'destructive', color: 'text-red-500' };
        if (item.stockAvailable <= item.minStock) return { label: 'Pocas Unidades', variant: 'default', color: 'text-yellow-500' };
        return { label: 'Disponible', variant: 'secondary', color: 'text-green-500' };
    };

    const availability = getAvailability();

    const profit = dropshipping.suggestedPrice - dropshipping.minPrice - (dropshipping.feeType === 'fixed' ? dropshipping.fee : dropshipping.suggestedPrice * (dropshipping.fee / 100));

    return (
        <Card className="flex flex-col">
            <CardHeader className="p-0">
                <div className="aspect-square w-full relative">
                    <Image 
                        src={dropshipping.photos?.[0] || item.photos?.[0] || 'https://placehold.co/400x400/1A1A1A/FFFFFF?text=?'} 
                        alt={item.name} 
                        fill 
                        className="object-cover rounded-t-lg"
                        data-ai-hint="product image" 
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-muted-foreground">{dropshipping.category || item.category}</p>
                <h3 className="font-semibold leading-tight flex-grow">{item.name}</h3>
                <div className="mt-4">
                     <p className="text-xs text-muted-foreground">Precio sugerido</p>
                    <p className="text-2xl font-bold">${dropshipping.suggestedPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Mínimo: ${dropshipping.minPrice.toLocaleString()} | Comisión: {dropshipping.feeType === 'fixed' ? `$${dropshipping.fee}` : `${dropshipping.fee}%`}</p>
                    <p className="text-sm font-semibold text-primary mt-1">Ganancia estimada: ${profit.toLocaleString()}</p>
                </div>
                 <Badge variant={availability.variant} className="w-fit my-3">{availability.label}</Badge>
                <Button className="w-full mt-auto" size="sm" disabled={availability.label === 'Agotado'}>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Crear Pedido
                </Button>
            </CardContent>
        </Card>
    );
};

const ProductCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader className="p-0">
            <Skeleton className="aspect-square w-full rounded-t-lg" />
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-5 w-full mb-4" />
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-9 w-full" />
        </CardContent>
    </Card>
)

export default function DropshippingCatalogPage() {
    const { user } = useAuth();
    const { firestore } = useContext(FirebaseContext);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!firestore) return;
        setIsLoading(true);
        const itemsQuery = query(
            collection(firestore, 'inventory'), 
            where('dropshipping.enabled', '==', true),
            where('stockAvailable', '>', 0)
        );

        const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
            setItems(itemsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching dropshipping items:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);
    
    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.dropshipping?.category || item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    if (!user || user.role !== 'client') {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-destructive">Acceso denegado.</p>
                </CardContent>
            </Card>
        )
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo de Dropshipping</h1>
        <p className="text-muted-foreground">
          Productos que puedes vender sin tener inventario. Nosotros nos encargamos de la entrega.
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Buscar por nombre o categoría..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : filteredItems.length > 0 ? (
            filteredItems.map(item => <ProductCard key={item.id} item={item} />)
        ) : (
            <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">No se encontraron productos de dropshipping.</p>
            </div>
        )}
      </div>
    </div>
  );
}
