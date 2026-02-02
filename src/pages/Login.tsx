import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Server, Lock, Mail, Shield, Users, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_USERS } from '@/types/user';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = login(email, password);
    
    if (success) {
      toast.success('¡Bienvenido a Gestor Voucher ATO!');
      navigate('/');
    } else {
      toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    
    // Auto-submit después de un pequeño delay para que el usuario vea las credenciales
    setTimeout(() => {
      const success = login(demoEmail, 'password123');
      if (success) {
        toast.success('¡Bienvenido a Gestor Voucher ATO!');
        navigate('/');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Panel Izquierdo - Información */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <Server className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Gestor Voucher ATO</h1>
              <p className="text-muted-foreground">Sistema de Gestión de Requerimientos</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Características</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <strong>Gestión Inteligente</strong>
                  <p className="text-sm text-muted-foreground">
                    30+ scripts de respuesta basados en casos reales
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <strong>Sistema de Escalamiento</strong>
                  <p className="text-sm text-muted-foreground">
                    Deriva casos a supervisores o áreas especializadas
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <strong>Multi-Rol</strong>
                  <p className="text-sm text-muted-foreground">
                    Perfiles diferenciados: Administrador, Supervisor, Analista
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Panel Derecho - Login */}
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa con tus credenciales o usa las cuentas demo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Formulario de Login */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@jetsmart.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Iniciar Sesión
              </Button>
            </form>

            {/* Credenciales Demo */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O usa credenciales demo
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                {/* Admin Demo */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleDemoLogin('admin@jetsmart.com')}
                >
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Administrador</div>
                    <div className="text-xs text-muted-foreground">admin@jetsmart.com</div>
                  </div>
                </Button>

                {/* Supervisor Demo */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleDemoLogin('supervisor@jetsmart.com')}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Supervisor</div>
                    <div className="text-xs text-muted-foreground">supervisor@jetsmart.com</div>
                  </div>
                </Button>

                {/* Analista Demo */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleDemoLogin('analista@jetsmart.com')}
                >
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Analista</div>
                    <div className="text-xs text-muted-foreground">analista@jetsmart.com</div>
                  </div>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Contraseña para todas las cuentas demo: <code className="bg-muted px-2 py-1 rounded">password123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;







