import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, List, BarChart, Settings, ChevronRight } from 'lucide-react';

const AdminPanel = () => {
  const adminSections = [
    {
      title: 'Gestión de Usuarios',
      description: 'Crear, activar/desactivar usuarios y asignar roles',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500/10 text-blue-600',
      count: 'Administrar usuarios del sistema',
    },
    {
      title: 'Gestión de Campos',
      description: 'Agregar/eliminar campos personalizados del formulario',
      icon: FileText,
      href: '/admin/fields',
      color: 'bg-green-500/10 text-green-600',
      count: 'Configurar campos dinámicos',
    },
    {
      title: 'Gestión de Listas',
      description: 'Modificar opciones de listas desplegables',
      icon: List,
      href: '/admin/lists',
      color: 'bg-purple-500/10 text-purple-600',
      count: 'Administrar dropdowns',
    },
    {
      title: 'Gestión de Dashboards',
      description: 'Crear dashboards personalizados por rol',
      icon: BarChart,
      href: '/admin/dashboards',
      color: 'bg-orange-500/10 text-orange-600',
      count: 'Diseñar vistas personalizadas',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        </div>
        <p className="text-muted-foreground">
          Configura y personaliza el sistema Gestor Voucher ATO
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} to={section.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${section.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl mt-4">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{section.count}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Accesos Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Crear Usuario
              </Button>
            </Link>
            <Link to="/admin/fields">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Nuevo Campo
              </Button>
            </Link>
            <Link to="/admin/lists">
              <Button variant="outline" className="w-full justify-start">
                <List className="h-4 w-4 mr-2" />
                Nueva Lista
              </Button>
            </Link>
            <Link to="/admin/dashboards">
              <Button variant="outline" className="w-full justify-start">
                <BarChart className="h-4 w-4 mr-2" />
                Nuevo Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;







