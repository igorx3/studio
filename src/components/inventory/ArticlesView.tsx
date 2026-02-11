'use client';
import { useState, useMemo } from 'react';
import { mockInventoryItems } from '@/lib/data';
import type { InventoryItem } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, LayoutGrid, List } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';

export function ArticlesView() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const filteredItems = useMemo(() => {
        let items = mockInventoryItems;
        if (user?.role === 'client') {
            items = items.filter(item => item.storeName === user.name);
        }
        if (!searchTerm) return items;

        return items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.storeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, user]);

    const getStatusVariant = (item: InventoryItem) => {
        if (item.status === 'Agotado' || item.stockAvailable <= 0) return 'destructive';
        if (item.stockAvailable <= item.reorderPoint) return 'default'; // This will be yellow/primary
        return 'secondary';
    }

    const getStatusLabel = (item: InventoryItem) => {
        if (item.status === 'Agotado' || item.stockAvailable <= 0) return 'Agotado';
        if (item.stockAvailable <= item.reorderPoint) return 'Stock Bajo';
        return item.status;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por nombre, SKU, tienda..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setViewMode('list')} disabled={viewMode === 'list'}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setViewMode('grid')} disabled={viewMode === 'grid'}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Artículo
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>SKU</TableHead>
                            {user?.role !== 'client' && <TableHead>Tienda</TableHead>}
                            <TableHead>Stock</TableHead>
                            <TableHead>Reservado</TableHead>
                            <TableHead>Valor</TableHead>
                            {user?.role !== 'client' && <TableHead>Ubicación</TableHead>}
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Image src={item.photoUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint="product image"/>
                                        {item.name}
                                    </div>
                                </TableCell>
                                <TableCell>{item.sku}</TableCell>
                                {user?.role !== 'client' && <TableCell>{item.storeName}</TableCell>}
                                <TableCell className="font-bold">{item.stockAvailable}</TableCell>
                                <TableCell>{item.stockReserved}</TableCell>
                                <TableCell>${item.declaredValue.toLocaleString()}</TableCell>
                                {user?.role !== 'client' && <TableCell>{item.location}</TableCell>}
                                <TableCell>
                                    <Badge variant={getStatusVariant(item)}>{getStatusLabel(item)}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {/* Grid view would be implemented here */}
                    <p className="text-muted-foreground col-span-full text-center p-8">La vista de cuadrícula está en construcción.</p>
                </div>
            )}
        </div>
    );
}
