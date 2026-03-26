import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Shield, Users, UserCheck, MessageSquare, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_USERS } from '@/types/user';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loggedUser = login(email, password);
    
    if (loggedUser) {
      toast.success('¡Bienvenido a Gestor Voucher ATO!');
      if (loggedUser.role === 'AEROPUERTO_ATO' || loggedUser.role === 'SOPORTE_CC') {
        navigate('/requirements');
      } else {
        navigate('/');
      }
    } else {
      toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    
    // Auto-submit después de un pequeño delay para que el usuario vea las credenciales
    setTimeout(() => {
      const loggedUser = login(demoEmail, 'password123');
      if (loggedUser) {
        toast.success('¡Bienvenido a Gestor Voucher ATO!');
        if (loggedUser.role === 'AEROPUERTO_ATO' || loggedUser.role === 'SOPORTE_CC') {
          navigate('/requirements');
        } else {
          navigate('/');
        }
      }
    }, 300);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-sidebar">
      {/* Fondo global (igual al sidebar): turquesa + marca de agua Aeropuerto */}
      <div
        className="absolute inset-0 bg-[url('/aeropuerto.jpg')] bg-cover bg-center opacity-20 blur-[1px] scale-105"
        aria-hidden="true"
      />
      {/* Overlay para asegurar contraste */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/35"
        aria-hidden="true"
      />

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Panel Izquierdo - Información */}
        <div className="hidden md:block relative overflow-hidden rounded-2xl border bg-card/50">
          {/* Fondo tipo marca de agua */}
          <div
            className="absolute inset-0 bg-[url('/aeropuerto.jpg')] bg-cover bg-center opacity-35 blur-[1px] scale-105 pointer-events-none"
            aria-hidden="true"
          />
          {/* Overlay para asegurar contraste */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/45 to-background/80 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 p-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <img
                src="/banner-header.png"
                alt="Gestor Voucher ATO"
                className="h-24 w-full max-w-[560px] object-contain"
              />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestor Voucher ATO</h1>
              <p className="text-muted-foreground">JetSMART · by Limitless</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Características</h2>
              <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <strong>Flujo Multi‑Rol</strong>
                  <p className="text-sm text-muted-foreground">
                    Perfiles: Aeropuerto (ATO), Soporte CC, Supervisor y Administrador
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <strong>Estados y control</strong>
                  <p className="text-sm text-muted-foreground">
                    Ingresado → En Gestión → Enviado (cierre)
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <strong>Gestión masiva</strong>
                  <p className="text-sm text-muted-foreground">
                    Exportación a CSV y acciones masivas para Soporte CC (Ingresado → En Gestión / En Gestión → Enviado)
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <strong>Interacciones por caso</strong>
                  <p className="text-sm text-muted-foreground">
                    Solicitudes de información con pendientes y bandeja de seguimiento (visible para Supervisor/Admin)
                  </p>
                </div>
              </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Login */}
        <Card className="relative overflow-hidden shadow-2xl bg-card/60">
          {/* Fondo replicado en el panel de login */}
          <div
            className="absolute inset-0 bg-[url('/aeropuerto.jpg')] bg-cover bg-center opacity-25 blur-[1px] scale-105 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/85 pointer-events-none"
            aria-hidden="true"
          />

          <CardHeader className="text-center">
            {/* Branding en móvil (el panel izquierdo está oculto) */}
            <div className="md:hidden flex flex-col items-center text-center gap-2">
              <img
                src="/banner-header.png"
                alt="Gestor Voucher ATO"
                className="h-16 w-full max-w-[320px] object-contain"
              />
              <h1 className="text-lg font-semibold tracking-tight text-foreground">Gestor Voucher ATO</h1>
              <div className="text-xs text-muted-foreground">JetSMART · by Limitless</div>
              <div className="w-full border-t mt-2" />
            </div>
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
          <CardContent className="relative z-10 space-y-6">
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

                {/* Aeropuerto (ATO) Demo */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleDemoLogin('ato@jetsmart.com')}
                >
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Aeropuerto (ATO)</div>
                    <div className="text-xs text-muted-foreground">ato@jetsmart.com</div>
                  </div>
                </Button>

                {/* Soporte CC Demo */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleDemoLogin('soportecc@jetsmart.com')}
                >
                  <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Soporte CC</div>
                    <div className="text-xs text-muted-foreground">soportecc@jetsmart.com</div>
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







