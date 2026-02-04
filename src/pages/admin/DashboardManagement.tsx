import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, PlusCircle, BarChart, Trash2 } from 'lucide-react';
import { UserRole } from '@/types/user';
import { toast } from 'sonner';

type WidgetType = 'estadisticas' | 'grafico' | 'lista' | 'tabla' | 'metrica';

interface Widget {
  id: string;
  name: string;
  type: WidgetType;
}

interface CustomDashboard {
  id: string;
  name: string;
  role: UserRole;
  widgets: Widget[];
  isActive: boolean;
  createdAt: Date;
}

const availableWidgets: Widget[] = [
  { id: 'w1', name: 'Estadísticas Generales', type: 'estadisticas' },
  { id: 'w2', name: 'Gráfico por Estado', type: 'grafico' },
  { id: 'w3', name: 'Gráfico por Origen', type: 'grafico' },
  { id: 'w4', name: 'Requerimientos Recientes', type: 'lista' },
  { id: 'w5', name: 'Tabla de Prioridades', type: 'tabla' },
  { id: 'w6', name: 'Métrica de SLA', type: 'metrica' },
  { id: 'w7', name: 'Casos en Revisión Supervisor', type: 'lista' },
  { id: 'w8', name: 'Productividad por Asesor', type: 'tabla' },
];

const DashboardManagement = () => {
  const navigate = useNavigate();
  
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([
    {
      id: '1',
      name: 'Dashboard Aeropuerto (ATO)',
      role: 'AEROPUERTO_ATO',
      widgets: [
        { id: 'w1', name: 'Estadísticas Generales', type: 'estadisticas' },
        { id: 'w4', name: 'Requerimientos Recientes', type: 'lista' },
      ],
      isActive: true,
      createdAt: new Date('2025-01-01'),
    },
  ]);

  const [newDashboard, setNewDashboard] = useState({
    name: '',
    role: 'AEROPUERTO_ATO' as UserRole,
  });

  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);

  const handleCreateDashboard = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedWidgets.length === 0) {
      toast.error('Selecciona al menos un widget');
      return;
    }

    const dashboard: CustomDashboard = {
      id: Date.now().toString(),
      ...newDashboard,
      widgets: availableWidgets.filter(w => selectedWidgets.includes(w.id)),
      isActive: true,
      createdAt: new Date(),
    };

    setDashboards([...dashboards, dashboard]);
    setNewDashboard({ name: '', role: 'AEROPUERTO_ATO' });
    setSelectedWidgets([]);
    toast.success(`Dashboard "${dashboard.name}" creado exitosamente`);
  };

  const toggleDashboardStatus = (id: string) => {
    setDashboards(dashboards.map(d =>
      d.id === id ? { ...d, isActive: !d.isActive } : d
    ));
    const dashboard = dashboards.find(d => d.id === id);
    toast.success(`Dashboard ${dashboard!.isActive ? 'desactivado' : 'activado'}`);
  };

  const deleteDashboard = (id: string) => {
    const dashboard = dashboards.find(d => d.id === id);
    if (confirm(`¿Eliminar el dashboard "${dashboard?.name}"?`)) {
      setDashboards(dashboards.filter(d => d.id !== id));
      toast.success('Dashboard eliminado');
    }
  };

  const toggleWidgetSelection = (widgetId: string) => {
    setSelectedWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'ADMINISTRADOR': return 'bg-red-500/10 text-red-600';
      case 'SUPERVISOR': return 'bg-blue-500/10 text-blue-600';
      case 'AEROPUERTO_ATO': return 'bg-emerald-500/10 text-emerald-600';
      case 'SOPORTE_CC': return 'bg-violet-500/10 text-violet-600';
    }
  };

  const getWidgetTypeBadge = (type: WidgetType) => {
    const config = {
      'estadisticas': { label: 'Estadísticas', class: 'bg-blue-500/10 text-blue-600' },
      'grafico': { label: 'Gráfico', class: 'bg-purple-500/10 text-purple-600' },
      'lista': { label: 'Lista', class: 'bg-green-500/10 text-green-600' },
      'tabla': { label: 'Tabla', class: 'bg-orange-500/10 text-orange-600' },
      'metrica': { label: 'Métrica', class: 'bg-pink-500/10 text-pink-600' },
    };
    return config[type];
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <Button onClick={() => navigate('/admin')} variant="outline" className="gap-2 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Volver al Panel
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart className="h-8 w-8" />
          Gestión de Dashboards
        </h1>
        <p className="text-muted-foreground mt-1">
          Crea dashboards personalizados para cada rol de usuario
        </p>
      </div>

      {/* Crear Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Crear Nuevo Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateDashboard} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre del Dashboard *</Label>
                <Input
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                  placeholder="Dashboard Personalizado"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Asignar a Rol *</Label>
                <Select
                  value={newDashboard.role}
                  onValueChange={(value) => setNewDashboard({ ...newDashboard, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AEROPUERTO_ATO">Aeropuerto (ATO)</SelectItem>
                    <SelectItem value="SOPORTE_CC">Soporte CC</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selecciona Widgets *</Label>
              <div className="grid gap-3 md:grid-cols-2 p-4 border rounded-lg">
                {availableWidgets.map((widget) => {
                  const typeBadge = getWidgetTypeBadge(widget.type);
                  return (
                    <div key={widget.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                      <Checkbox
                        id={widget.id}
                        checked={selectedWidgets.includes(widget.id)}
                        onCheckedChange={() => toggleWidgetSelection(widget.id)}
                      />
                      <Label htmlFor={widget.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span>{widget.name}</span>
                          <Badge className={`text-xs ${typeBadge.class}`}>
                            {typeBadge.label}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Seleccionados: {selectedWidgets.length} de {availableWidgets.length}
              </p>
            </div>

            <Button type="submit" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Crear Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Dashboards */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboards Configurados ({dashboards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className={`p-4 rounded-lg border ${
                  dashboard.isActive ? 'bg-card' : 'bg-muted/50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{dashboard.name}</h3>
                      {!dashboard.isActive && (
                        <Badge variant="secondary" className="text-xs">INACTIVO</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getRoleBadgeClass(dashboard.role)}>
                        {dashboard.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {dashboard.widgets.length} widgets
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dashboard.widgets.map((widget) => {
                        const typeBadge = getWidgetTypeBadge(widget.type);
                        return (
                          <Badge key={widget.id} variant="outline" className="text-xs">
                            {widget.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={dashboard.isActive}
                      onCheckedChange={() => toggleDashboardStatus(dashboard.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDashboard(dashboard.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardManagement;

