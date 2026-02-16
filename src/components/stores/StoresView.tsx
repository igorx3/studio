'use client';
import { useState, useMemo } from 'react';
import type { Store } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StoreFormDialog } from './StoreFormDialog';
import { format } from 'date-fns';

export function StoresView() {
    const firestore = useFirestore();
    const { isUserLoading: isAuthLoading } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const storesQuery = useMemoFirebase(() => {
        if (isAuthLoading || !firestore) return null;
        return query(collection(firestore, "stores"), orderBy("name"));
    }, [firestore, isAuthLoading]);
    const { data: storesData, isLoading } = useCollection<Store>(storesQuery);
    const stores = useMemo(() => storesData || [], [storesData]);

    const handleNew = () => {
        setSelectedStore(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: Store) => {
        setSelectedStore(item);
        setIsFormOpen(true);
    };

    const filteredItems = useMemo(() => {
        if (!stores) return [];
        if (!searchTerm) return stores;
        return stores.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, stores]);

    return (
        <Card>
            <StoreFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                store={selectedStore}
            />
            <CardHeader>
                <div className="grid gap-2">
                    <CardTitle>Gestión de Tiendas</CardTitle>
                    <CardDescription>Administra tus tiendas cliente, configura sus tarifas y reglas de negocio.</CardDescription>
                </div>
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
                        Nueva Tienda
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha Creación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isAuthLoading ? (
                            <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                        ) : filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No hay tiendas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map(item => (
                                <TableRow key={item.id} onClick={() => handleEdit(item)} className="cursor-pointer">
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.contactName}</TableCell>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>{item.phone}</TableCell>
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
