'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import React from 'react';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { UserMenu } from '@/components/dashboard/user-menu';
import {
  Package,
  Truck,
  Warehouse,
  DollarSign,
  Users,
  LayoutDashboard,
  MapPin,
  Map,
  ScanLine,
  ClipboardCheck,
  Building,
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Contact,
  Briefcase,
  ChevronDown,
  Database
} from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const operationsNavItems = [
  { href: '/dashboard', label: 'Tablero', icon: LayoutDashboard, roles: ['admin', 'operations', 'finance', 'client', 'courier', 'warehouse'] },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: Package, roles: ['admin', 'operations', 'client'] },
  { href: '/dashboard/asignados', label: 'Asignados', icon: ClipboardCheck, roles: ['admin', 'operations'] },
  { href: '/dashboard/pistoleo-masivo', label: 'Pistoleo Masivo', icon: ScanLine, roles: ['admin', 'warehouse'] },
  { href: '/dashboard/ubicacion', label: 'Ubicación', icon: MapPin, roles: ['admin', 'operations'] },
  { href: '/dashboard/rutas', label: 'Rutas', icon: Map, roles: ['admin', 'operations'] },
];

const adminNavItems = [
    { href: '/dashboard/mensajeros', label: 'Mensajeros', icon: Truck, roles: ['admin', 'operations'] },
    { href: '/dashboard/empleados', label: 'Empleados', icon: Users, roles: ['admin'] },
    { href: '/dashboard/clientes', label: 'Tiendas', icon: Contact, roles: ['admin', 'operations'] },
    { href: '/dashboard/destinatarios', label: 'Destinatarios', icon: Users, roles: ['admin', 'operations'] },
    { href: '/dashboard/suplidores', label: 'Suplidores', icon: Building, roles: ['admin'] },
    { href: '/dashboard/base-de-datos', label: 'Base de Datos', icon: Database, roles: ['admin'] },
    { href: '/dashboard/ingresos', label: 'Ingresos', icon: TrendingUp, roles: ['admin', 'finance'] },
    { href: '/dashboard/gastos', label: 'Gastos', icon: TrendingDown, roles: ['admin', 'finance'] },
    { href: '/dashboard/cuentas-por-pagar', label: 'Cuentas por Pagar', icon: ArrowDownCircle, roles: ['admin', 'finance'] },
    { href: '/dashboard/cuentas-por-cobrar', label: 'Cuentas por Cobrar', icon: ArrowUpCircle, roles: ['admin', 'finance'] },
    { href: '/dashboard/reportes-financieros', label: 'Reportes Financieros', icon: FileText, roles: ['admin', 'finance'] },
    { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
];

const mainNavItems = [
  { href: '/dashboard/finanzas', label: 'Finanzas', icon: DollarSign, roles: ['admin', 'finance'] },
  { href: '/dashboard/almacen', label: 'Almacén', icon: Warehouse, roles: ['admin', 'warehouse'] },
];


export function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);

  if (!user) return null;

  const userCanSee = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  const isOperationsSectionVisible = operationsNavItems.some(item => userCanSee(item.roles));
  const isAdministrationSectionVisible = adminNavItems.some(item => userCanSee(item.roles));
  const isMainSectionVisible = mainNavItems.some(item => userCanSee(item.roles));


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="p-2 space-y-2">
            <div className="flex items-center gap-2 p-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <span className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">Central de Operaciones</span>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between group-data-[collapsible=icon]:hidden">
                        Operaciones
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuItem>Operaciones</DropdownMenuItem>
                    <DropdownMenuItem>Logística</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between group-data-[collapsible=icon]:hidden">
                        Ver como usuario
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                     <DropdownMenuItem>Admin</DropdownMenuItem>
                     <DropdownMenuItem>Operaciones</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {isOperationsSectionVisible && operationsNavItems.filter(item => userCanSee(item.roles)).map(item => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton 
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={pathname === item.href ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                  variant={pathname === item.href ? 'default' : 'ghost'}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          
          {isAdministrationSectionVisible && (
              <Collapsible open={isAdminOpen} onOpenChange={setIsAdminOpen} className="w-full">
                <CollapsibleTrigger asChild className="group-data-[collapsible=icon]:hidden">
                     <Button variant="ghost" className="w-full justify-start gap-2 p-2">
                        <Users /> 
                        <span>Administración</span>
                        <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenu className="pl-6">
                    {adminNavItems.filter(item => userCanSee(item.roles)).map(item => (
                        <SidebarMenuItem key={item.href}>
                        <Link href={item.href} passHref>
                            <SidebarMenuButton 
                            isActive={pathname === item.href}
                            tooltip={item.label}
                            variant="ghost"
                            size="sm"
                            >
                            <item.icon />
                            <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
          )}

          {isMainSectionVisible && mainNavItems.filter(item => userCanSee(item.roles)).map(item => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton 
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  variant="ghost"
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
