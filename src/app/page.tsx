import { Package } from 'lucide-react';
import { LoginForm } from '@/components/login/login-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="items-center text-center">
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tighter text-primary">KhlothiaPack</h1>
            </div>
            <CardTitle className="text-2xl font-bold">Bienvenido de nuevo</CardTitle>
            <CardDescription>
              Inicia sesión para gestionar tus entregas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
