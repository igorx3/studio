'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export function DashboardHeader() {
    const pathname = usePathname();

    const getTitle = () => {
        switch(pathname) {
            case '/dashboard': return 'Resumen General';
            case '/dashboard/pedidos': return 'Gestión de Pedidos';
            case '/dashboard/mensajeros': return 'Gestión de Mensajeros';
            case '/dashboard/almacen': return 'Gestión de Almacén';
            case '/dashboard/finanzas': return 'Reconciliación Financiera';
            case '/dashboard/optimizar-rutas': return 'Optimizador de Rutas';
            case '/dashboard/cliente': return 'Portal de Cliente';
            default: return 'Dashboard';
        }
    }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-lg font-semibold">{getTitle()}</h1>
    </header>
  );
}
