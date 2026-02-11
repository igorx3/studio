'use client';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2, Search } from "lucide-react";
import { format, toDate } from "date-fns";
import { DateRange } from "react-day-picker";
import { useAuth } from '@/context/auth-context';
import { FirebaseContext } from '@/firebase/context';
import { collection, query, where, orderBy, limit, getDocs, startAfter, endBefore, limitToLast, Timestamp } from 'firebase/firestore';
import type { InventoryMovement, Store } from '@/lib/types';
import { cn } from '@/lib/utils';

const MOVEMENT_PAGE_SIZE = 20;

const movementTypeColors: { [key: string]: string } = {
  manual_entry: 'border-green-500 text-green-500',
  initial_stock: 'border-green-400 text-green-400',
  manual_exit: 'border-red-500 text-red-500',
  shrinkage: 'border-orange-500 text-orange-500',
  adjustment: 'border-blue-500 text-blue-500',
  order_reserve: 'border-yellow-500 text-yellow-500',
  order_dispatch: 'border-yellow-600 text-yellow-600',
  order_cancelled: 'border-gray-500 text-gray-500',
  order_returned: 'border-purple-500 text-purple-500',
};

export function MovementsView({ stores }: { stores: Store[] }) {
    const { user } = useAuth();
    const { firestore, isInitializing } = useContext(FirebaseContext);

    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filters
    const [storeFilter, setStoreFilter] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [firstDoc, setFirstDoc] = useState<any>(null);
    const [isLastPage, setIsLastPage] = useState(false);

    const fetchMovements = async (direction: 'next' | 'prev' | 'first' = 'first') => {
        if (!firestore) return;
        setIsLoading(true);

        let q = query(
            collection(firestore, "inventoryMovements"),
            orderBy("createdAt", "desc")
        );

        if (user?.role === 'client' && user.storeId) {
            q = query(q, where('storeId', '==', user.storeId));
        } else if (storeFilter) {
            q = query(q, where('storeId', '==', storeFilter));
        }

        if (dateRange?.from) {
             q = query(q, where('createdAt', '>=', dateRange.from));
        }
        if (dateRange?.to) {
             q = query(q, where('createdAt', '<=', dateRange.to));
        }

        if (direction === 'next' && lastDoc) {
            q = query(q, startAfter(lastDoc), limit(MOVEMENT_PAGE_SIZE));
        } else if (direction === 'prev' && firstDoc) {
            q = query(q, endBefore(firstDoc), limitToLast(MOVEMENT_PAGE_SIZE));
        } else {
            q = query(q, limit(MOVEMENT_PAGE_SIZE));
        }

        try {
            const docSnap = await getDocs(q);
            const newMovements = docSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryMovement));
            
            if (newMovements.length > 0) {
                setMovements(newMovements);
                setFirstDoc(docSnap.docs[0]);
                setLastDoc(docSnap.docs[docSnap.docs.length - 1]);
                setIsLastPage(docSnap.docs.length < MOVEMENT_PAGE_SIZE);
            } else {
                if (direction === 'first') setMovements([]);
                setIsLastPage(true);
            }
        } catch (error) {
            console.error("Error fetching movements: ", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (!isInitializing) {
            handleFilter();
        }
    }, [isInitializing, storeFilter, dateRange, user]);
    
    const handleFilter = () => {
        setCurrentPage(1);
        setLastDoc(null);
        setFirstDoc(null);
        fetchMovements('first');
    }

    const handleClearFilters = () => {
        setStoreFilter('');
        setDateRange(undefined);
    }
    
    const handleNextPage = () => {
        if (!isLastPage) {
            setCurrentPage(prev => prev + 1);
            fetchMovements('next');
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            fetchMovements('prev');
        }
    }

    const filteredMovements = useMemo(() => {
        if (!searchTerm) return movements;
        const lowerSearch = searchTerm.toLowerCase();
        return movements.filter(m => 
            m.itemName.toLowerCase().includes(lowerSearch) || 
            m.itemSku.toLowerCase().includes(lowerSearch) ||
            m.referenceId.toLowerCase().includes(lowerSearch)
        );
    }, [movements, searchTerm]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos Movimientos de Inventario</CardTitle>
        <CardDescription>Trazabilidad completa de cada cambio en el stock.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por producto, SKU, referencia..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {user?.role !== 'client' && (
                <Select value={storeFilter} onValueChange={setStoreFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por tienda..." />
                    </SelectTrigger>
                    <SelectContent>
                        {stores.map(store => <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                    dateRange.to ? (
                        <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(dateRange.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Seleccionar rango de fechas</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                />
                </PopoverContent>
            </Popover>
            <Button variant="ghost" onClick={handleClearFilters}>Limpiar Filtros</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Tienda</TableHead>
                <TableHead>Tipo Movimiento</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Stock Antes</TableHead>
                <TableHead className="text-center">Stock Después</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filteredMovements.length > 0 ? (
                filteredMovements.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>{mov.createdAt instanceof Timestamp ? format(mov.createdAt.toDate(), 'dd/MM/yy HH:mm') : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="font-medium">{mov.itemName}</div>
                      <div className="text-xs text-muted-foreground">{mov.itemSku}</div>
                    </TableCell>
                    <TableCell>{mov.storeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={movementTypeColors[mov.movementType] || ''}>
                        {mov.movementType.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{mov.referenceId}</TableCell>
                    <TableCell className={cn("text-center font-bold", mov.quantity > 0 ? 'text-green-500' : 'text-red-500')}>
                      {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                    </TableCell>
                    <TableCell className="text-center">{mov.stockBefore}</TableCell>
                    <TableCell className="text-center font-semibold">{mov.stockAfter}</TableCell>
                    <TableCell>{mov.userName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={9} className="h-24 text-center">No se encontraron movimientos para los filtros seleccionados.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>Anterior</Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={isLastPage}>Siguiente</Button>
        </div>
      </CardContent>
    </Card>
  );
}
