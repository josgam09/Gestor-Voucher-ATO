import { useCallback, useMemo, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import RequirementStatusBadge from '@/components/RequirementStatusBadge';
import RequirementPriorityBadge from '@/components/RequirementPriorityBadge';
import { Plus, Home, Download, Filter, Calendar as CalendarIcon, ChevronDown, ChevronUp, X, ArrowUpDown, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import { RequirementStatus, RequirementPriority, BaseOrigen, Pais, AsesorName, RequirementInteractionPriority } from '@/types/requirement';
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
  const { requirements, updateRequirement } = useRequirements();
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  // Soporte CC: fecha de envío para acción masiva
  const [fechaEnvioMasivo, setFechaEnvioMasivo] = useState(''); // yyyy-mm-dd
  
  // Estados para filtros - La fecha es el filtro principal
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<Pais | 'all'>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<RequirementPriority | 'all'>('all');
  const [origenFilter, setOrigenFilter] = useState<BaseOrigen | 'all'>('all');
  const [motivoFilter, setMotivoFilter] = useState<string>('all');
  const [interactionFilter, setInteractionFilter] = useState<'all' | 'pending' | 'none' | 'urgent' | 'normal'>('all');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [bulkAssignee, setBulkAssignee] = useState<string>('Soporte CC');
  const getPendingInteractionsPriority = useCallback((req: (typeof requirements)[number]): RequirementInteractionPriority | null => {
    const interactions = req.interactions || [];
    const pending = interactions.filter((it) => it.status === 'PENDIENTE');
    if (pending.length === 0) return null;
    return pending.some((it) => it.priority === 'URGENTE') ? 'URGENTE' : 'NORMAL';
  }, []);
  
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
    motivoFilter !== 'all',
    interactionFilter !== 'all',
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
    setMotivoFilter('all');
    setInteractionFilter('all');
    toast.success('Filtros limpiados');
  };

  const canBulkAssign = hasRole(['SUPERVISOR', 'ADMINISTRADOR']);

  const selectedCount = useMemo(() => {
    const ids = Object.keys(selectedIds).filter((id) => selectedIds[id]);
    return ids.length;
  }, [selectedIds]);

  const toggleSelectOne = (id: string, checked: boolean) => {
    if (!canBulkAssign) return;
    setSelectedIds((prev) => ({ ...prev, [id]: checked }));
  };

  const clearSelection = () => setSelectedIds({});

  const bulkAssign = () => {
    if (!canBulkAssign) return;
    if (!user) return;
    const ids = Object.keys(selectedIds).filter((id) => selectedIds[id]);
    if (ids.length === 0) {
      toast.error('Selecciona al menos un caso para asignar');
      return;
    }
    if (!bulkAssignee.trim()) {
      toast.error('Ingresa el responsable a asignar');
      return;
    }

    ids.forEach((id) => {
      const req = requirements.find((r) => r.id === id);
      if (!req) return;
      updateRequirement(id, {
        assignedTeam: 'Soporte CC',
        assignedTo: bulkAssignee.trim(),
        history: [
          ...req.history,
          {
            id: Date.now().toString(),
            date: new Date(),
            action: 'Asignación masiva',
            user: user.name,
            comment: `Asignado a: ${bulkAssignee.trim()}`,
          },
        ],
      });
    });

    toast.success(`Asignación aplicada: ${ids.length} caso(s)`);
    clearSelection();
  };

  // Primero filtrar por fecha para obtener el conjunto base
  const dateFilteredRequirements = useMemo(() => {
    let requirementsToShow = requirements;

    // Aeropuerto (ATO): solo ver requerimientos creados por el mismo usuario
    if (hasRole(['AEROPUERTO_ATO']) && user) {
      requirementsToShow = requirements.filter(req => req.nombreAsesor === user.name);
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
        (req.nombreAsesor?.toLowerCase() || '').includes(search.toLowerCase()) ||
        req.pnrTktLocalizador.toLowerCase().includes(search.toLowerCase()) ||
        (req.correoElectronico?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (req.pasajeroCorreo?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (req.motivo?.toLowerCase() || '').includes(search.toLowerCase());
      
      const matchesCountry = countryFilter === 'all' || req.pais === countryFilter;
      const matchesAssignedTo = assignedToFilter === 'all' || 
        (assignedToFilter === 'sin-asignar' ? !req.assignedTo : req.assignedTo === assignedToFilter);
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
      const matchesOrigen = origenFilter === 'all' || req.baseOrigen === origenFilter;
      const matchesMotivo = motivoFilter === 'all' || req.motivo === motivoFilter;
      const pendingPriority = getPendingInteractionsPriority(req);
      const matchesInteractions =
        interactionFilter === 'all' ||
        (interactionFilter === 'pending' && pendingPriority !== null) ||
        (interactionFilter === 'none' && pendingPriority === null) ||
        (interactionFilter === 'urgent' && pendingPriority === 'URGENTE') ||
        (interactionFilter === 'normal' && pendingPriority === 'NORMAL');

      return matchesSearch && matchesCountry && matchesAssignedTo && matchesStatus && matchesPriority && matchesOrigen && matchesMotivo && matchesInteractions;
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
  }, [dateFilteredRequirements, search, countryFilter, assignedToFilter, statusFilter, priorityFilter, origenFilter, motivoFilter, interactionFilter, sortColumn, sortDirection, getPendingInteractionsPriority]);

  const allVisibleSelected = useMemo(() => {
    if (!canBulkAssign) return false;
    if (filteredRequirements.length === 0) return false;
    return filteredRequirements.every((r) => selectedIds[r.id]);
  }, [canBulkAssign, filteredRequirements, selectedIds]);

  const toggleSelectAllVisible = (checked: boolean) => {
    if (!canBulkAssign) return;
    setSelectedIds((prev) => {
      const next = { ...prev };
      filteredRequirements.forEach((r) => {
        next[r.id] = checked;
      });
      return next;
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Ticket',
      'País',
      'Base Origen',
      'PNR',
      'Estado',
      'Fecha Envío',
      'Prioridad',
      'Asignado a',
      'Motivo',
      'Sub Motivo',
      'Monto Voucher (USD)',
      'Solicitante (ATO)',
      'Email Solicitante',
      'Hora Ingreso',
      'Comentarios',
      'Pasajero',
      'Documento',
      'Correo Pasajero',
      'Fecha Vuelo',
      'N° Vuelo',
      'Tramo',
      'Operado por',
      'Observaciones',
      'Equipo',
      'Fecha Creación',
    ];
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
      req.subMotivo || '',
      typeof req.montoVoucherUsd === 'number' ? req.montoVoucherUsd : '',
      req.nombreAsesor || '',
      req.correoElectronico || '',
      req.horaIngresoCorreo || '',
      req.comentariosAdicionales || '',
      req.pasajeroNombreApellido || '',
      req.pasajeroDocumento || '',
      req.pasajeroCorreo || '',
      req.fechaVuelo ? new Date(req.fechaVuelo).toLocaleDateString('es-AR') : '',
      req.numeroVuelo || '',
      req.tramoVuelo || '',
      req.vueloOperadoPor || '',
      req.observaciones || '',
      req.assignedTeam || '',
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

  // Soporte CC: descargar base "Ingresado" y marcar "En Gestión"
  const exportIngresadosAndMarkEnGestion = () => {
    const ingresados = filteredRequirements.filter(r => r.status === 'ingresado');

    const headers = ['Ticket', 'País', 'Base Origen', 'PNR', 'Estado', 'Prioridad', 'Motivo', 'Fecha Creación'];
    const rows = ingresados.map(req => [
      req.ticketNumber,
      req.pais,
      req.baseOrigen,
      req.pnrTktLocalizador,
      req.status,
      req.priority,
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
    link.setAttribute('download', `requerimientos_ingresados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Marcar como "En Gestión" automáticamente al descargar (masivo)
    ingresados.forEach(req => {
      updateRequirement(req.id, {
        status: 'en-gestion',
        assignedTeam: 'Soporte CC',
        assignedTo: user?.name || 'Soporte CC',
        history: [
          ...req.history,
          {
            id: Date.now().toString(),
            date: new Date(),
            action: 'Caso en gestión (masivo)',
            user: user?.name || 'Soporte CC',
            comment: 'Cambio automático al descargar base de casos ingresados',
          },
        ],
      });
    });

    toast.success(`Base descargada: ${ingresados.length} casos. Estado actualizado a "En Gestión".`);
  };

  // Soporte CC: marcar como ENVIADO (masivo) los casos "En Gestión" del set filtrado
  const markEnviadosMasivo = () => {
    if (!fechaEnvioMasivo) {
      toast.error('Por favor ingresa la fecha de envío para el cambio masivo');
      return;
    }

    const enGestion = filteredRequirements.filter(r => r.status === 'en-gestion');
    if (enGestion.length === 0) {
      toast.error('No hay casos en estado "En Gestión" en el listado actual');
      return;
    }

    enGestion.forEach(req => {
      updateRequirement(req.id, {
        status: 'enviado',
        fechaEnvioVoucher: new Date(`${fechaEnvioMasivo}T00:00:00`),
        resolvedAt: new Date(`${fechaEnvioMasivo}T00:00:00`),
        assignedTeam: 'Soporte CC',
        assignedTo: user?.name || 'Soporte CC',
        history: [
          ...req.history,
          {
            id: Date.now().toString(),
            date: new Date(),
            action: 'Caso Cerrado por envío de Voucher por Parte de Soporte CC',
            user: user?.name || 'Soporte CC',
            comment: `Fecha de envío: ${fechaEnvioMasivo}`,
          },
        ],
      });
    });

    toast.success(`Cambio masivo aplicado: ${enGestion.length} casos marcados como ENVIADO.`);
  };

  // Obtener bases únicas para el filtro (dependiente de país)
  const uniqueBases = useMemo(() => {
    const relevant = countryFilter === 'all'
      ? dateFilteredRequirements
      : dateFilteredRequirements.filter(r => r.pais === countryFilter);

    return Array.from(
      new Set(relevant.map(r => r.baseOrigen).filter(Boolean))
    ).sort();
  }, [dateFilteredRequirements, countryFilter]);

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
          {hasRole(['SOPORTE_CC']) && (
            <>
              <Button onClick={exportIngresadosAndMarkEnGestion} variant="default" className="gap-2">
                <Download className="h-4 w-4" />
                Descargar base (Ingresado)
              </Button>

              <div className="hidden md:flex items-center gap-2">
                <Input
                  type="date"
                  value={fechaEnvioMasivo}
                  onChange={(e) => setFechaEnvioMasivo(e.target.value)}
                  className="h-10 w-[160px]"
                  aria-label="Fecha de envío masivo"
                />
                <Button onClick={markEnviadosMasivo} variant="secondary" className="gap-2">
                  Marcar ENVIADO (En Gestión)
                </Button>
              </div>
            </>
          )}
          {hasRole(['ADMINISTRADOR', 'AEROPUERTO_ATO']) && (
          <Link to="/requirements/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Requerimiento
            </Button>
          </Link>
          )}
        </div>
      </div>

      {/* Asignación masiva (Supervisor/Admin) */}
      {canBulkAssign && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm">
                <span className="font-semibold">Asignación masiva</span>
                <span className="text-muted-foreground"> · Seleccionados: {selectedCount}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  value={bulkAssignee}
                  onChange={(e) => setBulkAssignee(e.target.value)}
                  placeholder="Asignar a (ej: Soporte CC)"
                  className="h-9 w-[220px]"
                />
                <Button onClick={bulkAssign} disabled={selectedCount === 0} className="h-9">
                  Asignar seleccionados
                </Button>
                <Button onClick={clearSelection} variant="outline" className="h-9">
                  Limpiar selección
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                placeholder="Ticket, PNR, correo..."
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
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
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
                      <SelectItem value="DO">🇩🇴 República Dominicana</SelectItem>
                      <SelectItem value="PY">🇵🇾 Paraguay</SelectItem>
                      <SelectItem value="PE">🇵🇪 Perú</SelectItem>
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

                {/* Interacciones */}
                <div>
                  <Label htmlFor="interactionFilter" className="text-xs font-medium mb-1.5 block">Interacciones</Label>
                  <Select value={interactionFilter} onValueChange={(value) => setInteractionFilter(value as typeof interactionFilter)}>
                    <SelectTrigger id="interactionFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="pending">Con pendientes</SelectItem>
                      <SelectItem value="none">Sin pendientes</SelectItem>
                      <SelectItem value="urgent">Pendiente Urgente</SelectItem>
                      <SelectItem value="normal">Pendiente Normal</SelectItem>
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
                    {canBulkAssign && (
                      <TableHead className="py-2 w-[44px]">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={allVisibleSelected}
                            onCheckedChange={(v) => toggleSelectAllVisible(v === true)}
                            aria-label="Seleccionar todos"
                          />
                        </div>
                      </TableHead>
                    )}
                    <TableHead className="py-2 w-[90px] text-xs font-semibold">
                      Interacción
                    </TableHead>
                    <TableHead className="py-2">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('ticketNumber')}>
                        Ticket
                        {sortColumn === 'ticketNumber' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                        {sortColumn !== 'ticketNumber' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                      </Button>
                    </TableHead>
                    <TableHead className="py-2 text-xs font-semibold">
                      Código de Reserva (PNR)
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
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Solicitante (ATO)</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Email Solicitante</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Hora Ingreso</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Sub Motivo</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Comentarios</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Pasajero</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Documento</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Correo Pasajero</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Fecha Vuelo</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">N° Vuelo</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Tramo</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Operado por</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Monto Voucher (USD)</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Observaciones</TableHead>
                    <TableHead className="py-2 text-xs font-semibold whitespace-nowrap">Equipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequirements.map((req) => (
                    <TableRow key={req.id} className="cursor-pointer hover:bg-accent" onClick={() => handleRowClick(req.id)}>
                      {canBulkAssign && (
                        <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={!!selectedIds[req.id]}
                              onCheckedChange={(v) => toggleSelectOne(req.id, v === true)}
                              aria-label={`Seleccionar ${req.ticketNumber}`}
                            />
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="py-2">
                        {(() => {
                          const pr = getPendingInteractionsPriority(req);
                          if (!pr) return <span className="text-xs text-muted-foreground">-</span>;
                          const urgent = pr === 'URGENTE';
                          return (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded border font-semibold ${
                                urgent
                                  ? 'border-destructive/30 text-destructive bg-destructive/10'
                                  : 'border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300'
                              }`}
                              title="Interacción pendiente"
                            >
                              <MessageSquare className="h-3 w-3" />
                              {pr}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
                            {req.ticketNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono">{req.pnrTktLocalizador}</span>
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
                      <TableCell className="py-2">
                        <span className="text-xs whitespace-nowrap">{req.nombreAsesor || '-'}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs whitespace-nowrap" title={req.correoElectronico || ''}>
                          {req.correoElectronico || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono whitespace-nowrap">{req.horaIngresoCorreo || '-'}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs whitespace-nowrap" title={req.subMotivo || ''}>
                          {req.subMotivo || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs max-w-[220px] inline-block truncate align-middle" title={req.comentariosAdicionales || ''}>
                          {req.comentariosAdicionales || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs whitespace-nowrap" title={req.pasajeroNombreApellido || ''}>
                          {req.pasajeroNombreApellido || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs whitespace-nowrap" title={req.pasajeroDocumento || ''}>
                          {req.pasajeroDocumento || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs whitespace-nowrap" title={req.pasajeroCorreo || ''}>
                          {req.pasajeroCorreo || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs whitespace-nowrap">
                          {req.fechaVuelo ? new Date(req.fechaVuelo).toLocaleDateString('es-AR') : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono whitespace-nowrap">{req.numeroVuelo || '-'}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono whitespace-nowrap" title={req.tramoVuelo || ''}>
                          {req.tramoVuelo || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono whitespace-nowrap">{req.vueloOperadoPor || '-'}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono whitespace-nowrap">{Number.isFinite(req.montoVoucherUsd) ? req.montoVoucherUsd : '-'}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs max-w-[220px] inline-block truncate align-middle" title={req.observaciones || ''}>
                          {req.observaciones || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs whitespace-nowrap">{req.assignedTeam || '-'}</span>
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
