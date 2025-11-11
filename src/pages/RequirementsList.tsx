import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequirements } from '@/contexts/RequirementContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import RequirementStatusBadge from '@/components/RequirementStatusBadge';
import RequirementPriorityBadge from '@/components/RequirementPriorityBadge';
import { Plus, Home, Download, Filter, Calendar as CalendarIcon, ChevronDown, ChevronUp, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { RequirementStatus, RequirementPriority, OrigenConsulta, TipoSolicitud, Pais, AsesorName } from '@/types/requirement';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { calcularTiempoPorEstado, calcularTiempoTotal } from '@/utils/timeUtils';

// Lista de asesores
const ASESORES: AsesorName[] = [
  'Jenny Andrea Taborda', 'Jhoan Restrepo', 'José Ramos', 'Julieth Urbina',
  'Luz Lozada', 'Manuela Maz', 'Mauricio Rios', 'Nazly Lugo',
  'Rafael Carmona', 'Sandra Milena Jaramillo', 'Sofia Guarin',
  'Valentina Mejía', 'Viviana Virlen'
];

const RequirementsList = () => {
  const { requirements } = useRequirements();
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // Estados para filtros - La fecha es el filtro principal
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<Pais | 'all'>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<RequirementPriority | 'all'>('all');
  const [origenFilter, setOrigenFilter] = useState<OrigenConsulta | 'all'>('all');
  const [tipoSolicitudFilter, setTipoSolicitudFilter] = useState<TipoSolicitud | 'all'>('all');
  const [motivoFilter, setMotivoFilter] = useState<string>('all');
  
  // Estados de ordenamiento
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Contador de filtros activos
  const activeFiltersCount = [
    dateFilter !== 'all',
    search !== '',
    countryFilter !== 'all',
    assignedToFilter !== 'all',
    statusFilter !== 'all',
    priorityFilter !== 'all',
    origenFilter !== 'all',
    tipoSolicitudFilter !== 'all',
    motivoFilter !== 'all',
  ].filter(Boolean).length;

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setDateFilter('all');
    setDateRange(undefined);
    setSearch('');
    setCountryFilter('all');
    setAssignedToFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setOrigenFilter('all');
    setTipoSolicitudFilter('all');
    setMotivoFilter('all');
    toast.success('Filtros limpiados');
  };

  // Primero filtrar por fecha para obtener el conjunto base
  const dateFilteredRequirements = useMemo(() => {
    let requirementsToShow = requirements;

    // Si es analista, solo mostrar casos asignados a él
    if (hasRole(['ANALISTA']) && user) {
      requirementsToShow = requirements.filter(req => req.assignedTo === user.name);
    }

    // Aplicar filtro de fecha primero
    if (dateFilter !== 'all') {
      requirementsToShow = requirementsToShow.filter((req) => {
        const reqDate = new Date(req.createdAt);
        const today = new Date();
        
        switch (dateFilter) {
          case 'today':
            return reqDate.toDateString() === today.toDateString();
          case 'week':
            return isWithinInterval(reqDate, {
              start: startOfWeek(today, { weekStartsOn: 1 }),
              end: endOfWeek(today, { weekStartsOn: 1 })
            });
          case 'month':
            return isWithinInterval(reqDate, {
              start: startOfMonth(today),
              end: endOfMonth(today)
            });
          case 'year':
            return isWithinInterval(reqDate, {
              start: startOfYear(today),
              end: endOfYear(today)
            });
          case 'custom':
            if (dateRange?.from) {
              if (dateRange.to) {
                return isWithinInterval(reqDate, {
                  start: dateRange.from,
                  end: dateRange.to
                });
              } else {
                return reqDate >= dateRange.from;
              }
            }
            return true;
          default:
            return true;
        }
      });
    }

    return requirementsToShow;
  }, [requirements, dateFilter, dateRange, hasRole, user]);

  // Luego aplicar los demás filtros sobre el conjunto filtrado por fecha
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
    const filtered = dateFilteredRequirements.filter((req) => {
      const matchesSearch =
        req.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        req.asuntoCorreoElectronico.toLowerCase().includes(search.toLowerCase()) ||
        (req.nombreAsesor?.toLowerCase() || '').includes(search.toLowerCase()) ||
        req.pnrTktLocalizador.toLowerCase().includes(search.toLowerCase()) ||
        (req.motivo?.toLowerCase() || '').includes(search.toLowerCase());
      
      const matchesCountry = countryFilter === 'all' || req.pais === countryFilter;
      const matchesAssignedTo = assignedToFilter === 'all' || 
        (assignedToFilter === 'sin-asignar' ? !req.assignedTo : req.assignedTo === assignedToFilter);
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
      const matchesOrigen = origenFilter === 'all' || req.origenConsulta === origenFilter;
      const matchesTipoSolicitud = tipoSolicitudFilter === 'all' || req.tipoSolicitud === tipoSolicitudFilter;
      const matchesMotivo = motivoFilter === 'all' || req.motivo === motivoFilter;

      return matchesSearch && matchesCountry && matchesAssignedTo && matchesStatus && matchesPriority && matchesOrigen && matchesTipoSolicitud && matchesMotivo;
    });

    // Aplicar ordenamiento
    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

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
        case 'asuntoCorreoElectronico':
          aValue = a.asuntoCorreoElectronico;
          bValue = b.asuntoCorreoElectronico;
          break;
        case 'origenConsulta':
          aValue = a.origenConsulta;
          bValue = b.origenConsulta;
          break;
        case 'tipoSolicitud':
          aValue = a.tipoSolicitud;
          bValue = b.tipoSolicitud;
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
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dateFilteredRequirements, search, countryFilter, assignedToFilter, statusFilter, priorityFilter, origenFilter, tipoSolicitudFilter, motivoFilter, sortColumn, sortDirection]);

  const exportToCSV = () => {
    const headers = ['Ticket', 'País', 'Origen', 'Tipo', 'Asunto', 'PNR/TKT', 'Estado', 'Prioridad', 'Asignado a', 'Motivo', 'Fecha Creación'];
    const rows = filteredRequirements.map(req => [
      req.ticketNumber,
      req.pais,
      req.origenConsulta,
      req.tipoSolicitud,
      req.asuntoCorreoElectronico,
      req.pnrTktLocalizador,
      req.status,
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
    link.setAttribute('download', `requerimientos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Archivo CSV descargado exitosamente');
  };

  // Obtener motivos únicos para el filtro
  const uniqueMotivos = useMemo(() => {
    const motivos = new Set<string>();
    dateFilteredRequirements.forEach(req => {
      if (req.motivo) motivos.add(req.motivo);
    });
    return Array.from(motivos).sort();
  }, [dateFilteredRequirements]);

  // Función para manejar el click en una fila
  const handleRowClick = (requirementId: string) => {
    navigate(`/requirements/${requirementId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Requerimientos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Administra y da seguimiento a todos los requerimientos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          {hasRole(['ADMINISTRADOR', 'SUPERVISOR']) && (
          <Link to="/requirements/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Requerimiento
            </Button>
          </Link>
          )}
        </div>
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
                setDateFilter(value as any);
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
                <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="en-proceso">En Proceso</SelectItem>
                  <SelectItem value="pendiente-informacion">Pendiente Info</SelectItem>
                  <SelectItem value="pendiente-supervisor">Pendiente Supervisor</SelectItem>
                  <SelectItem value="pendiente-otra-area">Pendiente Otra Área</SelectItem>
                  <SelectItem value="pendiente-agencia">Pendiente Agencia</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
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
            </div>
          </div>

          {/* Rango de Fechas Personalizado */}
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
                      <SelectItem value="EC">🇪🇨 Ecuador</SelectItem>
                      <SelectItem value="PY">🇵🇾 Paraguay</SelectItem>
                      <SelectItem value="PE">🇵🇪 Perú</SelectItem>
                      <SelectItem value="RD">🇩🇴 RD</SelectItem>
                      <SelectItem value="UY">🇺🇾 Uruguay</SelectItem>
                      <SelectItem value="US">🇺🇸 Estados Unidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Origen */}
                <div>
                  <Label htmlFor="origenFilter" className="text-xs font-medium mb-1.5 block">Origen</Label>
                  <Select value={origenFilter} onValueChange={(value) => setOrigenFilter(value as OrigenConsulta | 'all')}>
                    <SelectTrigger id="origenFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="AMADEUS">AMADEUS</SelectItem>
                      <SelectItem value="SABRE">SABRE</SelectItem>
                      <SelectItem value="NO CORRESPONDE">NO CORRESPONDE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Solicitud */}
                <div>
                  <Label htmlFor="tipoSolicitudFilter" className="text-xs font-medium mb-1.5 block">Tipo</Label>
                  <Select value={tipoSolicitudFilter} onValueChange={(value) => setTipoSolicitudFilter(value as TipoSolicitud | 'all')}>
                    <SelectTrigger id="tipoSolicitudFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Solicitudes">Solicitudes</SelectItem>
                      <SelectItem value="Reclamos">Reclamos</SelectItem>
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            Requerimientos ({filteredRequirements.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            {filteredRequirements.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron requerimientos</p>
              </div>
            ) : (
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
                    <TableHead className="py-2">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('asuntoCorreoElectronico')}>
                        Asunto
                        {sortColumn === 'asuntoCorreoElectronico' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                        {sortColumn !== 'asuntoCorreoElectronico' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                      </Button>
                    </TableHead>
                    <TableHead className="py-2">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('origenConsulta')}>
                        Origen
                        {sortColumn === 'origenConsulta' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                        {sortColumn !== 'origenConsulta' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
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
                  {filteredRequirements.map((req) => (
                    <TableRow key={req.id} className="cursor-pointer hover:bg-accent" onClick={() => handleRowClick(req.id)}>
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
                        <span className="text-xs font-medium">{req.asuntoCorreoElectronico}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs">{req.origenConsulta}</span>
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
                  ))}
                </TableBody>
              </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequirementsList;
