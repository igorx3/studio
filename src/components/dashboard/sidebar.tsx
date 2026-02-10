'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { UserMenu } from '@/components/dashboard/user-menu';
import {
  Package,
  Truck,
  Warehouse,
  Landmark,
  DollarSign,
  Bot,
  Users,
  Settings,
  LayoutDashboard
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operations', 'finance'] },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: Package, roles: ['admin', 'operations', 'client'] },
  { href: '/dashboard/mensajeros', label: 'Mensajeros', icon: Truck, roles: ['admin', 'operations'] },
  { href: '/dashboard/almacen', label: 'Almacén', icon: Landmark, roles: ['admin', 'warehouse'] },
  { href: '/dashboard/finanzas', label: 'Finanzas', icon: DollarSign, roles: ['admin', 'finance'] },
  { href: '/dashboard/optimizar-rutas', label: 'Optimizar Rutas', icon: Bot, roles: ['admin', 'operations'] },
  { href: '/dashboard/cliente', label: 'Portal Cliente', icon: Users, roles: ['client'] },
  { href: '/dashboard/admin', label: 'Administración', icon: Settings, roles: ['admin'] },
];

export function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  
  const accessibleNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Warehouse className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-primary">KhlothiaPack</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {accessibleNavItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton 
                  isActive={pathname === item.href}
                  tooltip={item.label}
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
