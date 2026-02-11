'use client';
import { useState, useMemo } from 'react';
import type { ArticleCategory } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CategoryFormDialog } from './CategoryFormDialog';
import { format } from 'date-fns';

export function CategoriesView() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | null>(null);

    const categoriesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "articleCategories"), orderBy("name"));
    }, [firestore]);
    const { data: categoriesData, isLoading } = useCollection<ArticleCategory>(categoriesQuery);
    const categories = useMemo(() => categoriesData || [], [categoriesData]);

    const handleNew = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: ArticleCategory) => {
        setSelectedCategory(item);
        setIsFormOpen(true);
    };

    const filteredItems = useMemo(() => {
        if (!categories) return [];
        if (!searchTerm) return categories;
        return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, categories]);

    return (
        <Card>
            <CategoryFormDialog 
                isOpen={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                category={selectedCategory}
            />
            <CardHeader>
                <CardTitle>Categorías de Artículos</CardTitle>
                <CardDescription>Gestiona las categorías para organizar tu inventario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por nombre..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Categoría
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha Creación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                        ) : filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No hay categorías.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map(item => (
                                <TableRow key={item.id} onClick={() => handleEdit(item)} className="cursor-pointer">
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'active' ? 'secondary' : 'outline'}>
                                            {item.status === 'active' ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.createdAt ? format((item.createdAt as any).toDate(), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
