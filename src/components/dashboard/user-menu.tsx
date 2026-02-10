'use client';

import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center gap-2 p-2">
      <Skeleton className="h-10 w-10 rounded-full"/>
      <div className="flex-1 space-y-2 group-data-[collapsible=icon]:hidden">
        <Skeleton className="h-4 w-24"/>
        <Skeleton className="h-3 w-32"/>
      </div>
    </div>
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const roleDisplay: Record<string, string> = {
      admin: 'Usuario admin',
      operations: 'Usuario de operaciones',
      client: 'Cliente',
      courier: 'Mensajero',
      finance: 'Usuario de finanzas',
      warehouse: 'Usuario de almacén'
  }

  return (
    <div className="p-2 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{roleDisplay[user.role]}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 group-data-[collapsible=icon]:hidden" onClick={logout}>
            <LogOut className="h-4 w-4"/>
          </Button>
        </div>
    </div>
  );
}
