'use client';
import { useState, useMemo } from 'react';
import type { InventoryItem, Store } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, LayoutGrid, List } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { ArticleFormDialog } from './ArticleFormDialog';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

interface ArticlesViewProps {
    items: InventoryItem[];
    stores: Store[];
}

export function ArticlesView({ items, stores }: ArticlesViewProps) {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<InventoryItem | null>(null);
    const isAdmin = user?.role === 'admin' || user?.role === 'operations';

    const handleNewArticle = () => {
        setSelectedArticle(null);
        setIsFormOpen(true);
    };

    const handleEditArticle = (item: InventoryItem) => {
        setSelectedArticle(item);
        setIsFormOpen(true);
    };

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.storeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, items]);

    const getStatus = (item: InventoryItem): { label: string; badgeVariant: 'destructive' | 'default' | 'secondary' | 'outline'; textClass: string; } => {
        if (item.stockAvailable <= 0) return { label: 'Agotado', badgeVariant: 'destructive', textClass: 'text-red-500' };
        if (item.stockAvailable <= item.minStock) return { label: 'Stock Crítico', badgeVariant: 'destructive', textClass: 'text-orange-500' };
        if (item.stockAvailable < item.idealStock) return { label: 'Stock Bajo', badgeVariant: 'default', textClass: 'text-yellow-500' };
        return { label: 'Activo', badgeVariant: 'secondary', textClass: 'text-green-500' };
    }

    return (
        <div className="space-y-4">
            <ArticleFormDialog 
                isOpen={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                article={selectedArticle}
                stores={stores}
            />
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
                    {isAdmin && (
                        <Button onClick={handleNewArticle}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Artículo
                        </Button>
                    )}
                </div>
            </div>

            {viewMode === 'list' ? (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">Foto</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead>SKU</TableHead>
                                {user?.role !== 'client' && <TableHead>Tienda</TableHead>}
                                <TableHead>Stock</TableHead>
                                <TableHead>Reservado</TableHead>
                                <TableHead>Tarifa Normal</TableHead>
                                {isAdmin && <TableHead>Sub-Ubicación</TableHead>}
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 9 : 8} className="h-24 text-center">
                                        No hay artículos en el inventario.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map(item => {
                                    const status = getStatus(item);
                                    return (
                                    <TableRow key={item.id} onClick={() => handleEditArticle(item)} className="cursor-pointer">
                                        <TableCell>
                                             <Image src={item.photos?.[0] || 'https://placehold.co/40x40/1A1A1A/FFFFFF?text=?'} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint="product image"/>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.sku}</TableCell>
                                        {user?.role !== 'client' && <TableCell>{item.storeName}</TableCell>}
                                        <TableCell className={cn("font-bold", status.textClass)}>{item.stockAvailable}</TableCell>
                                        <TableCell>{item.stockReserved}</TableCell>
                                        <TableCell>${item.normalPrice.toLocaleString()}</TableCell>
                                        {isAdmin && <TableCell>{item.warehouseSubLocation}</TableCell>}
                                        <TableCell>
                                            <Badge variant={status.badgeVariant}>{status.label}</Badge>
                                        </TableCell>
                                    </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>
            ) : (
                 <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">La vista de cuadrícula está en construcción.</p>
                     </CardContent>
                </Card>
            )}
        </div>
    );
}
