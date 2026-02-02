import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, List, PlusCircle, Menu, Settings, LogOut, Shield, Users as UsersIcon, UserCheck, Inbox } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  // Navegación base para todos
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMINISTRADOR', 'SUPERVISOR', 'ANALISTA'] },
    { name: 'Requerimientos', href: '/requirements', icon: List, roles: ['ADMINISTRADOR', 'SUPERVISOR', 'ANALISTA'] },
  ];

  // Navegación según rol
  const roleNavigation = [
    // Analista puede crear nuevos requerimientos
    { name: 'Nuevo Requerimiento', href: '/requirements/new', icon: PlusCircle, roles: ['ADMINISTRADOR', 'ANALISTA', 'SUPERVISOR'] },
    // Supervisor tiene bandeja especial
    { name: 'Bandeja Supervisor', href: '/supervisor/inbox', icon: Inbox, roles: ['ADMINISTRADOR', 'SUPERVISOR'] },
    // Administrador tiene panel de administración
    { name: 'Panel Admin', href: '/admin', icon: Settings, roles: ['ADMINISTRADOR'] },
  ];

  // Filtrar navegación según rol del usuario
  const navigation = [...baseNavigation, ...roleNavigation].filter(item =>
    !user || item.roles.includes(user.role)
  );

  // Obtener iniciales del usuario
  const getUserInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Color del badge según rol
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMINISTRADOR': return 'bg-red-500/10 text-red-600';
      case 'SUPERVISOR': return 'bg-blue-500/10 text-blue-600';
      case 'ANALISTA': return 'bg-green-500/10 text-green-600';
      default: return 'bg-muted';
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
          <div className="flex shrink-0 flex-col gap-2 pt-4">
            <img
              src="/logo-sidebar.svg"
              alt="Gestor Voucher ATO"
              className="w-full max-w-[200px] h-auto"
            />
            <div className="leading-tight">
              <h1 className="text-base font-semibold text-white whitespace-nowrap">Gestor Voucher ATO</h1>
              <p className="text-xs text-white/80 whitespace-nowrap">JetSMART · by Limitless</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                            ${
                              isActive(item.href)
                                ? 'bg-sidebar-accent text-white'
                                : 'text-white hover:bg-sidebar-accent hover:text-white'
                            }
                          `}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
          
          {/* User Info Section */}
          {user && (
            <div className="mt-auto border-t border-sidebar-border pt-4">
              <div className="flex items-center gap-3 px-2">
                <Avatar>
                  <AvatarFallback className={getRoleBadgeColor(user.role)}>
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 mt-3 text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
                <div className="flex shrink-0 flex-col gap-2 pt-4">
                  <img
                    src="/logo-sidebar.svg"
                    alt="Gestor Voucher ATO"
                    className="w-full max-w-[200px] h-auto"
                  />
                  <div className="leading-tight">
                    <h1 className="text-base font-semibold text-white whitespace-nowrap">Gestor Voucher ATO</h1>
                    <p className="text-xs text-white/80 whitespace-nowrap">JetSMART · by Limitless</p>
                  </div>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={() => setOpen(false)}
                                className={`
                                  group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                                  ${
                                    isActive(item.href)
                                      ? 'bg-sidebar-accent text-sidebar-primary'
                                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                                  }
                                `}
                              >
                                <Icon className="h-6 w-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
                
                {/* User Info Mobile */}
                {user && (
                  <div className="mt-auto border-t border-sidebar-border pt-4">
                    <div className="flex items-center gap-3 px-2">
                      <Avatar>
                        <AvatarFallback className={getRoleBadgeColor(user.role)}>
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-sidebar-foreground truncate">
                          {user.name}
                        </p>
                        <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 mt-3 text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex flex-col items-start gap-1">
            <img
              src="/logo-sidebar.svg"
              alt="Gestor Voucher ATO"
              className="h-7 w-auto max-w-[180px]"
            />
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-white whitespace-nowrap">Gestor Voucher ATO</h1>
              <p className="text-[11px] text-white/80 whitespace-nowrap">JetSMART · by Limitless</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
