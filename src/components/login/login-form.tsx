'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, User, Building, Truck, Wallet, Warehouse } from 'lucide-react';
import type { UserRole } from '@/lib/types';

const roleButtons: { role: UserRole, label: string, icon: React.ElementType }[] = [
    { role: 'admin', label: 'Admin', icon: Shield },
    { role: 'operations', label: 'Operaciones', icon: User },
    { role: 'client', label: 'Cliente', icon: Building },
    { role: 'courier', label: 'Mensajero', icon: Truck },
    { role: 'finance', label: 'Finanzas', icon: Wallet },
    { role: 'warehouse', label: 'Almacén', icon: Warehouse },
];

export function LoginForm() {
  const { loginAs, isLoading } = useAuth();
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-center text-muted-foreground">
        Selecciona un rol para iniciar sesión en el modo de demostración.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {roleButtons.map(({ role, label, icon: Icon }) => (
             <Button 
                key={role}
                variant="outline" 
                className="w-full justify-start text-left h-12" 
                onClick={() => loginAs(role)} 
                disabled={isLoading}
            >
                <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground -mt-1">{role}@khlothia.pack</p>
                </div>
            </Button>
        ))}

        {isLoading && (
            <div className="col-span-2 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
            </div>
        )}
      </div>
    </div>
  );
}
