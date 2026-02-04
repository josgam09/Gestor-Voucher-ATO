import { useRequirements } from '@/contexts/RequirementContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useState } from 'react';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Plus, Download, Filter, Calendar as CalendarIcon, PieChart as PieChartIcon, BarChart as BarChartIcon, ChevronDown, ChevronUp, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RequirementStatus, RequirementPriority, BaseOrigen, Pais, AsesorName } from '@/types/requirement';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';
import RequirementStatusBadge from '@/components/RequirementStatusBadge';

// Lista de asesores
const ASESORES: AsesorName[] = [
  'Jenny Andrea Taborda', 'Jhoan Restrepo', 'José Ramos', 'Julieth Urbina',
  'Luz Lozada', 'Manuela Maz', 'Mauricio Rios', 'Nazly Lugo',
  'Rafael Carmona', 'Sandra Milena Jaramillo', 'Sofia Guarin',
  'Valentina Mejía', 'Viviana Virlen'
];

const Dashboard = () => {
  const { requirements } = useRequirements();
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  // Estados para filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<RequirementPriority | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [countryFilter, setCountryFilter] = useState<Pais | 'all'>('all');
  const [origenFilter, setOrigenFilter] = useState<BaseOrigen | 'all'>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [motivoFilter, setMotivoFilter] = useState<string>('all');

  // Estados de ordenamiento
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Contador de filtros activos
  const activeFiltersCount = [
    dateFilter !== 'all',
    search !== '',
    statusFilter !== 'all',
    priorityFilter !== 'all',
    countryFilter !== 'all',
    origenFilter !== 'all',
    assignedToFilter !== 'all',
    motivoFilter !== 'all',
  ].filter(Boolean).length;

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
    setDateRange(undefined);
    setCountryFilter('all');
    setOrigenFilter('all');
    setAssignedToFilter('all');
    setMotivoFilter('all');
    toast.success('Filtros limpiados');
  };

  // Filtrar casos según el rol
  const requirementsToShow = hasRole(['AEROPUERTO_ATO']) && user
    ? requirements.filter(req => req.nombreAsesor === user.name)
    : requirements;

  // Función para manejar el ordenamiento
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredRequirements = useMemo(() => {
    const filtered = requirementsToShow.filter((req) => {
      // Filtro de búsqueda
      const matchesSearch = !search || 
        req.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        req.pnrTktLocalizador.toLowerCase().includes(search.toLowerCase()) ||
        req.nombreAsesor.toLowerCase().includes(search.toLowerCase());

      // Filtro de estado
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

      // Filtro de prioridad
      const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;

      // Filtro de fecha
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const reqDate = new Date(req.createdAt);
        const today = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = reqDate.toDateString() === today.toDateString();
            break;
          case 'week':
            matchesDate = isWithinInterval(reqDate, {
              start: startOfWeek(today, { weekStartsOn: 1 }),
              end: endOfWeek(today, { weekStartsOn: 1 })
            });
            break;
          case 'month':
            matchesDate = isWithinInterval(reqDate, {
              start: startOfMonth(today),
              end: endOfMonth(today)
            });
            break;
          case 'year':
            matchesDate = isWithinInterval(reqDate, {
              start: startOfYear(today),
              end: endOfYear(today)
            });
            break;
          case 'custom':
            if (dateRange?.from) {
              if (dateRange.to) {
                matchesDate = isWithinInterval(reqDate, {
                  start: dateRange.from,
                  end: dateRange.to
                });
              } else {
                matchesDate = reqDate >= dateRange.from;
              }
            }
            break;
        }
      }

      // Filtro de país
      const matchesCountry = countryFilter === 'all' || req.pais === countryFilter;

      // Filtro de origen
      const matchesOrigen = origenFilter === 'all' || req.baseOrigen === origenFilter;

      // Filtro de asignado a
      const matchesAssignedTo = assignedToFilter === 'all' || 
        (assignedToFilter === 'sin-asignar' ? !req.assignedTo : req.assignedTo === assignedToFilter);

      // Filtro de motivo
      const matchesMotivo = motivoFilter === 'all' || req.motivo === motivoFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesDate && matchesCountry && matchesOrigen && matchesAssignedTo && matchesMotivo;
    });

    // Aplicar ordenamiento
    return filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortColumn) {
        case 'ticketNumber':
          aValue = a.ticketNumber;
          bValue = b.ticketNumber;
          break;
        case 'pais':
          aValue = a.pais;
          bValue = b.pais;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'baseOrigen':
          aValue = a.baseOrigen;
          bValue = b.baseOrigen;
          break;
        case 'motivo':
          aValue = a.motivo || '';
          bValue = b.motivo || '';
          break;
        case 'assignedTo':
          aValue = a.assignedTo || '';
          bValue = b.assignedTo || '';
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [requirementsToShow, search, statusFilter, priorityFilter, dateFilter, dateRange, countryFilter, origenFilter, assignedToFilter, motivoFilter, sortColumn, sortDirection]);

  const stats = {
    total: filteredRequirements.length,
    ingresado: filteredRequirements.filter(r => r.status === 'ingresado').length,
    enGestion: filteredRequirements.filter(r => r.status === 'en-gestion').length,
    revisionSupervisor: filteredRequirements.filter(r => r.status === 'revision-supervisor').length,
    enviado: filteredRequirements.filter(r => r.status === 'enviado').length,
    critical: filteredRequirements.filter(r => r.priority === 'critica').length,
  };

  // Datos para gráficos (solo para admin y supervisor)
  const origenChartData = useMemo(() => {
    const origenCounts: Record<string, number> = {};
    filteredRequirements.forEach(req => {
      origenCounts[req.baseOrigen] = (origenCounts[req.baseOrigen] || 0) + 1;
    });
    return Object.entries(origenCounts).map(([origen, count]) => ({
      origen,
      count,
      name: origen,
    }));
  }, [filteredRequirements]);

  const assignedToChartData = useMemo(() => {
    const assignedCounts: Record<string, { total: number; nuevo: number; enGestion: number; cerrado: number }> = {};
    
    // Inicializar con todos los asesores
    ASESORES.forEach(asesor => {
      assignedCounts[asesor] = { total: 0, nuevo: 0, enGestion: 0, cerrado: 0 };
    });
    assignedCounts['Sin asignar'] = { total: 0, nuevo: 0, enGestion: 0, cerrado: 0 };
    
    filteredRequirements.forEach(req => {
      const asesor = req.assignedTo || 'Sin asignar';
      if (!assignedCounts[asesor]) {
        assignedCounts[asesor] = { total: 0, nuevo: 0, enGestion: 0, cerrado: 0 };
      }
      assignedCounts[asesor].total += 1;
      if (req.status === 'ingresado') assignedCounts[asesor].nuevo += 1;
      if (req.status === 'en-gestion' || req.status === 'revision-supervisor') assignedCounts[asesor].enGestion += 1;
      if (req.status === 'enviado') assignedCounts[asesor].cerrado += 1;
    });
    
    return Object.entries(assignedCounts)
      .filter(([_, counts]) => counts.total > 0)
      .map(([asesor, counts]) => ({
        asesor,
        total: counts.total,
        nuevos: counts.nuevo,
        enGestion: counts.enGestion,
        cerrados: counts.cerrado,
      }));
  }, [filteredRequirements]);

  const motivoChartData = useMemo(() => {
    const motivoCounts: Record<string, { total: number; pendiente: number; cerrado: number }> = {};
    
    filteredRequirements.forEach(req => {
      if (!req.motivo) return;
      const motivo = req.motivo;
      if (!motivoCounts[motivo]) {
        motivoCounts[motivo] = { total: 0, pendiente: 0, cerrado: 0 };
      }
      motivoCounts[motivo].total += 1;
      if (req.status !== 'enviado') motivoCounts[motivo].pendiente += 1;
      if (req.status === 'enviado') motivoCounts[motivo].cerrado += 1;
    });
    
    return Object.entries(motivoCounts).map(([motivo, counts]) => ({
      motivo: motivo.length > 20 ? motivo.substring(0, 20) + '...' : motivo,
      fullMotivo: motivo,
      pendiente: counts.pendiente,
      cerrado: counts.cerrado,
      total: counts.total,
    }));
  }, [filteredRequirements]);

  // Colores corporativos PANTONE
  const PANTONE_3125 = 'rgb(0, 174, 199)';   // Turquesa
  const PANTONE_534 = 'rgb(21, 50, 102)';    // Azul oscuro
  const PANTONE_1805 = 'rgb(175, 39, 47)';   // Rojo

  // Paleta de colores con degradados de los PANTONE
  const COLORS = [
    PANTONE_3125,           // Turquesa principal
    PANTONE_534,            // Azul oscuro principal
    PANTONE_1805,           // Rojo principal
    'rgb(77, 201, 219)',    // Turquesa claro (degradado de 3125)
    'rgb(51, 94, 140)',     // Azul medio (degradado de 534)
    'rgb(199, 89, 96)',     // Rojo claro (degradado de 1805)
    'rgb(156, 163, 175)',   // Gris medio
    'rgb(107, 114, 128)',   // Gris oscuro
    'rgb(209, 213, 219)',   // Gris claro
  ];

  const ORIGEN_COLORS: Record<string, string> = {
    'AMADEUS': PANTONE_3125,           // Turquesa
    'SABRE': PANTONE_534,               // Azul oscuro
    'NO CORRESPONDE': PANTONE_1805,     // Rojo
  };

  const exportToCSV = () => {
    const headers = ['Ticket', 'País', 'Base Origen', 'PNR', 'Estado', 'Fecha Envío', 'Prioridad', 'Asignado a', 'Motivo', 'Fecha Creación'];
    const rows = filteredRequirements.map(req => [
      req.ticketNumber,
      req.pais,
      req.baseOrigen,
      req.pnrTktLocalizador,
      req.status,
      req.fechaEnvioVoucher ? new Date(req.fechaEnvioVoucher).toLocaleDateString('es-AR') : '',
      req.priority,
      req.assignedTo || '',
      req.motivo || '',
      new Date(req.createdAt).toLocaleString('es-AR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_requirements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Obtener bases únicas para el filtro (dependiente de país)
  const uniqueBases = useMemo(() => {
    const relevant = countryFilter === 'all'
      ? requirementsToShow
      : requirementsToShow.filter(r => r.pais === countryFilter);

    return Array.from(
      new Set(relevant.map(r => r.baseOrigen).filter(Boolean))
    ).sort();
  }, [requirementsToShow, countryFilter]);

  // Obtener motivos únicos para el filtro
  const uniqueMotivos = useMemo(() => {
    const motivos = new Set<string>();
    requirementsToShow.forEach(req => {
      if (req.motivo) motivos.add(req.motivo);
    });
    return Array.from(motivos).sort();
  }, [requirementsToShow]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {hasRole(['AEROPUERTO_ATO']) 
              ? `Tus requerimientos ingresados - ${user?.name}`
              : hasRole(['SOPORTE_CC'])
              ? 'Gestión de vouchers (casos ingresados por ATO)'
              : hasRole(['SUPERVISOR'])
              ? 'Control y supervisión de todos los casos'
              : 'Resumen general de requerimientos y gestión'
            }
          </p>
        </div>
        {hasRole(['ADMINISTRADOR', 'SUPERVISOR', 'AEROPUERTO_ATO']) && (
        <Link to="/requirements/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Requerimiento
          </Button>
        </Link>
        )}
      </div>

      {/* Estadísticas Compactas */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title={hasRole(['AEROPUERTO_ATO']) ? "Mis Requerimientos" : "Total Requerimientos"}
          value={stats.total}
          icon={TrendingUp}
          trend="+12% vs mes anterior"
          trendUp={false}
          color="primary"
        />
        <StatCard
          title="Ingresados"
          value={stats.ingresado}
          icon={AlertCircle}
          color="primary"
        />
        <StatCard
          title="En Gestión"
          value={stats.enGestion}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Revisión Supervisor"
          value={stats.revisionSupervisor}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Enviados"
          value={stats.enviado}
          icon={CheckCircle}
          color="success"
        />
      </div>

      {/* Filtros Híbridos - Compactos */}
        <Card>
        <CardContent className="pt-4 pb-3">
          {/* Filtros Principales - Siempre Visibles */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5 mb-3">
            {/* Periodo */}
            <div>
              <Label htmlFor="dateFilter" className="text-xs font-medium mb-1.5 block">Periodo</Label>
              <Select value={dateFilter} onValueChange={(value) => {
                setDateFilter(value as 'all' | 'today' | 'week' | 'month' | 'year' | 'custom');
                if (value !== 'custom') setDateRange(undefined);
              }}>
                <SelectTrigger id="dateFilter" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mes</SelectItem>
                  <SelectItem value="year">Año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div>
              <Label htmlFor="search" className="text-xs font-medium mb-1.5 block">Buscar</Label>
              <Input
                id="search"
                placeholder="Ticket, asunto, PNR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="statusFilter" className="text-xs font-medium mb-1.5 block">Estado</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RequirementStatus | 'all')}>
                <SelectTrigger id="statusFilter" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ingresado">Ingresado</SelectItem>
                  <SelectItem value="en-gestion">En Gestión</SelectItem>
                  <SelectItem value="revision-supervisor">Revisión Supervisor</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div>
              <Label htmlFor="priorityFilter" className="text-xs font-medium mb-1.5 block">Prioridad</Label>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as RequirementPriority | 'all')}>
                <SelectTrigger id="priorityFilter" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón Filtros Avanzados + Limpiar */}
            <div className="flex gap-2 items-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex-1 h-9"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Más
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
                {showAdvancedFilters ? <ChevronUp className="ml-1.5 h-3.5 w-3.5" /> : <ChevronDown className="ml-1.5 h-3.5 w-3.5" />}
              </Button>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-9 px-2"
                  title="Limpiar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                className="h-9 px-2"
                title="Exportar CSV"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rango de Fechas Personalizado - Aparece si es necesario */}
          {dateFilter === 'custom' && (
            <div className="mb-3 pb-3 border-b">
              <Label className="text-xs font-medium mb-1.5 block">Rango de Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("h-9 justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>{format(dateRange.from, "dd/MM/yy", { locale: es })} - {format(dateRange.to, "dd/MM/yy", { locale: es })}</>
                      ) : format(dateRange.from, "dd/MM/yy", { locale: es })
                    ) : <span>Seleccione rango</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Filtros Avanzados - Colapsables */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* País */}
                <div>
                  <Label htmlFor="countryFilter" className="text-xs font-medium mb-1.5 block">País</Label>
                  <Select value={countryFilter} onValueChange={(value) => setCountryFilter(value as Pais | 'all')}>
                    <SelectTrigger id="countryFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                      <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                      <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                      <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                      <SelectItem value="DO">🇩🇴 República Dominicana</SelectItem>
                      <SelectItem value="EC">🇪🇨 Ecuador</SelectItem>
                      <SelectItem value="PE">🇵🇪 Perú</SelectItem>
                      <SelectItem value="PY">🇵🇾 Paraguay</SelectItem>
                      <SelectItem value="UY">🇺🇾 Uruguay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Base Origen */}
                <div>
                  <Label htmlFor="origenFilter" className="text-xs font-medium mb-1.5 block">Base Origen</Label>
                  <Select value={origenFilter} onValueChange={(value) => setOrigenFilter(value as BaseOrigen | 'all')}>
                    <SelectTrigger id="origenFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueBases.map((base) => (
                        <SelectItem key={base} value={base}>
                          {base}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Asignado a */}
                <div>
                  <Label htmlFor="assignedToFilter" className="text-xs font-medium mb-1.5 block">Asignado a</Label>
                  <Select value={assignedToFilter} onValueChange={(value) => setAssignedToFilter(value)}>
                    <SelectTrigger id="assignedToFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                      {ASESORES.map((asesor) => (
                        <SelectItem key={asesor} value={asesor}>
                          {asesor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Motivo */}
                <div>
                  <Label htmlFor="motivoFilter" className="text-xs font-medium mb-1.5 block">Motivo</Label>
                  <Select value={motivoFilter} onValueChange={(value) => setMotivoFilter(value)}>
                    <SelectTrigger id="motivoFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueMotivos.map((motivo) => (
                        <SelectItem key={motivo} value={motivo}>
                          {motivo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráficos - Solo para Admin y Supervisor */}
      {hasRole(['ADMINISTRADOR', 'SUPERVISOR']) && filteredRequirements.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Gráfico de Torta - Requerimientos por Base Origen */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-4 w-4" />
                Requerimientos por Base Origen
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={origenChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ origen, count, percent }) => `${origen}: ${count} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {origenChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ORIGEN_COLORS[entry.origen] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Barras Agrupadas - Por Asignado a */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChartIcon className="h-4 w-4" />
                Requerimientos por Asesor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={assignedToChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asesor" angle={-45} textAnchor="end" height={100} fontSize={11} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nuevos" fill={PANTONE_3125} name="Nuevos" />
                  <Bar dataKey="enGestion" fill={PANTONE_534} name="En Gestión" />
                  <Bar dataKey="cerrados" fill={PANTONE_1805} name="Enviados (Cerrados)" />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

          {/* Gráfico de Barras Apiladas - Por Motivos */}
        <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChartIcon className="h-4 w-4" />
                Requerimientos por Motivo
              </CardTitle>
          </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={motivoChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="motivo" width={150} fontSize={11} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border-2 rounded shadow-lg" style={{ borderColor: PANTONE_534 }}>
                            <p className="font-semibold mb-2" style={{ color: PANTONE_534 }}>{data.fullMotivo}</p>
                            <p className="text-sm font-medium" style={{ color: PANTONE_534 }}>Pendientes: {data.pendiente}</p>
                            <p className="text-sm font-medium" style={{ color: PANTONE_3125 }}>Enviados: {data.cerrado}</p>
                            <p className="text-sm font-bold mt-1" style={{ color: PANTONE_1805 }}>Total: {data.total}</p>
                </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="pendiente" stackId="a" fill={PANTONE_534} name="Pendiente" />
                  <Bar dataKey="cerrado" stackId="a" fill={PANTONE_3125} name="Enviado (Cerrado)" />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Tabla de Requerimientos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Listado de Requerimientos ({filteredRequirements.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('ticketNumber')}>
                      Ticket
                      {sortColumn === 'ticketNumber' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'ticketNumber' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('pais')}>
                      País
                      {sortColumn === 'pais' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'pais' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('createdAt')}>
                      Fecha<br/>Ingreso
                      {sortColumn === 'createdAt' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'createdAt' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('status')}>
                      Estado
                      {sortColumn === 'status' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'status' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2 text-xs font-semibold">
                    Fecha Envío
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('baseOrigen')}>
                      Base Origen
                      {sortColumn === 'baseOrigen' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'baseOrigen' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('motivo')}>
                      Motivo
                      {sortColumn === 'motivo' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'motivo' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('assignedTo')}>
                      Asignado<br/>a
                      {sortColumn === 'assignedTo' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'assignedTo' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No se encontraron requerimientos con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequirements.slice(0, 20).map((req) => (
                    <TableRow key={req.id} className="cursor-pointer hover:bg-accent" onClick={() => navigate(`/requirements/${req.id}`)}>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
                          {req.ticketNumber}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-semibold">{req.pais}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-xs">
                          {new Date(req.initialDate).toLocaleDateString('es-AR')}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(req.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <RequirementStatusBadge status={req.status} />
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs">
                          {req.fechaEnvioVoucher ? new Date(req.fechaEnvioVoucher).toLocaleDateString('es-AR') : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono">{req.baseOrigen}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs">{req.motivo || '-'}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        {req.assignedTo ? (
                          <span className="text-xs font-medium">{req.assignedTo}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
