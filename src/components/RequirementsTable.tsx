import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Requirement } from '@/types/requirement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import RequirementStatusBadge from '@/components/RequirementStatusBadge';
import RequirementPriorityBadge from '@/components/RequirementPriorityBadge';
import { calcularTiempoPorEstado, calcularTiempoTotal } from '@/utils/timeUtils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Download,
  Clock,
  Calendar,
  User,
  Building2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { RequirementInteractionPriority } from '@/types/requirement';

interface RequirementsTableProps {
  requirements: Requirement[];
  title?: string;
  showFilters?: boolean;
  onExport?: (filteredRequirements: Requirement[]) => void;
}

type SortField = 
  | 'ticketNumber'
  | 'status'
  | 'statusChangedAt'
  | 'pais'
  | 'initialDate'
  | 'horaIngresoCorreo'
  | 'baseOrigen'
  | 'motivo'
  | 'subMotivo'
  | 'assignedTo'
  | 'priority';

type SortDirection = 'asc' | 'desc';

const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  title = "Requerimientos",
  showFilters = true,
  onExport
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('initialDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getPendingInteractionsSummary = (req: Requirement): { count: number; priority?: RequirementInteractionPriority } => {
    const interactions = req.interactions || [];
    const pending = interactions.filter((it) => it.status === 'PENDIENTE');
    const count = pending.length;
    if (count === 0) return { count: 0 };
    const priority = pending.some((it) => it.priority === 'URGENTE') ? 'URGENTE' : 'NORMAL';
    return { count, priority };
  };

  // Función para calcular tiempo transcurrido en minutos
  const calculateTimeElapsed = (horaIngreso: string, fechaIngreso: Date): string => {
    const now = new Date();
    const ingresoTime = new Date(fechaIngreso);
    
    // Extraer hora y minutos del string de hora
    const [hours, minutes] = horaIngreso.split(':').map(Number);
    ingresoTime.setHours(hours, minutes, 0, 0);
    
    const diffMs = now.getTime() - ingresoTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else if (diffMinutes < 1440) { // menos de 24 horas
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      const hours = Math.floor((diffMinutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
  };

  // Función para manejar el click en una fila
  const handleRowClick = (requirementId: string) => {
    navigate(`/requirements/${requirementId}`);
  };

  // Función para manejar el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para obtener el icono de ordenamiento
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  // Filtrar y ordenar requerimientos
  const filteredAndSortedRequirements = useMemo(() => {
    const filtered = requirements.filter(requirement => {
      const searchLower = searchTerm.toLowerCase();
      return (
        requirement.ticketNumber.toLowerCase().includes(searchLower) ||
        requirement.pnrTktLocalizador.toLowerCase().includes(searchLower) ||
        (requirement.correoElectronico?.toLowerCase() || '').includes(searchLower) ||
        (requirement.pasajeroCorreo?.toLowerCase() || '').includes(searchLower) ||
        requirement.nombreAsesor.toLowerCase().includes(searchLower) ||
        requirement.motivo.toLowerCase().includes(searchLower) ||
        requirement.subMotivo.toLowerCase().includes(searchLower)
      );
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number | Date = '';
      let bValue: string | number | Date = '';

      switch (sortField) {
        case 'ticketNumber':
          aValue = a.ticketNumber;
          bValue = b.ticketNumber;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'statusChangedAt':
          aValue = a.statusChangedAt ? new Date(a.statusChangedAt) : new Date(0);
          bValue = b.statusChangedAt ? new Date(b.statusChangedAt) : new Date(0);
          break;
        case 'pais':
          aValue = a.pais;
          bValue = b.pais;
          break;
        case 'initialDate':
          aValue = new Date(a.initialDate);
          bValue = new Date(b.initialDate);
          break;
        case 'horaIngresoCorreo':
          aValue = a.horaIngresoCorreo;
          bValue = b.horaIngresoCorreo;
          break;
        case 'baseOrigen':
          aValue = a.baseOrigen;
          bValue = b.baseOrigen;
          break;
        case 'motivo':
          aValue = a.motivo;
          bValue = b.motivo;
          break;
        case 'subMotivo':
          aValue = a.subMotivo;
          bValue = b.subMotivo;
          break;
        case 'assignedTo':
          aValue = a.assignedTo || '';
          bValue = b.assignedTo || '';
          break;
        case 'priority': {
          const priorityOrder = { critica: 4, alta: 3, media: 2, baja: 1 } as const;
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        }
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [requirements, searchTerm, sortField, sortDirection]);

  // Función para exportar a CSV
  const handleExport = () => {
    if (onExport) {
      onExport(filteredAndSortedRequirements);
    } else {
      const csvContent = [
        // Encabezados
        [
          'Número Único',
          'Código de Reserva (PNR)',
          'Estado',
          'País',
          'Fecha Ingreso',
          'Hora Ingreso',
          'Tiempo Transcurrido',
          'Base Origen',
          'Motivo',
          'Sub Motivo',
          'Asignado a',
          'Prioridad',
          'Monto Voucher (USD)',
          'Fecha Envío Voucher',
          'Solicitante (ATO)',
          'Email Solicitante',
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
          'Estado Final',
        ],
        // Datos
        ...filteredAndSortedRequirements.map(req => [
          req.ticketNumber,
          req.pnrTktLocalizador,
          req.status,
          req.pais,
          new Date(req.initialDate).toLocaleDateString('es-AR'),
          req.horaIngresoCorreo,
          calculateTimeElapsed(req.horaIngresoCorreo, req.initialDate),
          req.baseOrigen,
          req.motivo,
          req.subMotivo,
          req.assignedTo || 'Sin asignar',
          req.priority,
          typeof req.montoVoucherUsd === 'number' ? req.montoVoucherUsd : '',
          req.fechaEnvioVoucher ? new Date(req.fechaEnvioVoucher).toLocaleDateString('es-AR') : '',
          req.nombreAsesor || '',
          req.correoElectronico || '',
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
          req.status
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Archivo CSV exportado: ${filteredAndSortedRequirements.length} requerimientos`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado con título y controles */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {filteredAndSortedRequirements.length} requerimientos
          </Badge>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      {showFilters && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ticket, PNR o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-[44px]"></TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('ticketNumber')}
              >
                <div className="flex items-center gap-1">
                  Número
                  {getSortIcon('ticketNumber')}
                </div>
              </TableHead>
              <TableHead className="text-xs">
                PNR
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Estado
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('statusChangedAt')}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tiempo Estado
                  {getSortIcon('statusChangedAt')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('pais')}
              >
                <div className="flex items-center gap-1">
                  País
                  {getSortIcon('pais')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('initialDate')}
              >
                <div className="flex items-center gap-1">
                  Fecha
                  {getSortIcon('initialDate')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('horaIngresoCorreo')}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Hora Ingreso
                  {getSortIcon('horaIngresoCorreo')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('baseOrigen')}
              >
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Base Origen
                  {getSortIcon('baseOrigen')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('motivo')}
              >
                <div className="flex items-center gap-1">
                  Motivo
                  {getSortIcon('motivo')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('subMotivo')}
              >
                <div className="flex items-center gap-1">
                  Sub Motivo
                  {getSortIcon('subMotivo')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('assignedTo')}
              >
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Asignado
                  {getSortIcon('assignedTo')}
                </div>
              </TableHead>
              <TableHead className="text-xs">Solicitante</TableHead>
              <TableHead className="text-xs">Email Solicitante</TableHead>
              <TableHead className="text-xs">Comentarios</TableHead>
              <TableHead className="text-xs">Pasajero</TableHead>
              <TableHead className="text-xs">Documento</TableHead>
              <TableHead className="text-xs">Correo Pasajero</TableHead>
              <TableHead className="text-xs">Fecha Vuelo</TableHead>
              <TableHead className="text-xs">N° Vuelo</TableHead>
              <TableHead className="text-xs">Tramo</TableHead>
              <TableHead className="text-xs">Operado</TableHead>
              <TableHead className="text-xs">Monto (USD)</TableHead>
              <TableHead className="text-xs">Fecha Envío</TableHead>
              <TableHead className="text-xs">Observaciones</TableHead>
              <TableHead className="text-xs">Equipo</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Estado Final
                  {getSortIcon('priority')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('initialDate')}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tiempo Total
                  {getSortIcon('initialDate')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequirements.map((requirement) => (
              <TableRow 
                key={requirement.id} 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => handleRowClick(requirement.id)}
              >
                <TableCell className="text-xs">
                  {(() => {
                    const summary = getPendingInteractionsSummary(requirement);
                    if (summary.count === 0) return null;
                    const isUrgent = summary.priority === 'URGENTE';
                    return (
                      <span
                        className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold ${
                          isUrgent
                            ? 'border-destructive/30 text-destructive bg-destructive/10'
                            : 'border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300'
                        }`}
                        title="Interacción pendiente"
                      >
                        <MessageSquare className="h-3 w-3" />
                        {summary.priority}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">{requirement.ticketNumber}</Badge>
                    <ExternalLink className="h-2 w-2 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {requirement.pnrTktLocalizador}
                </TableCell>
                <TableCell>
                  <RequirementStatusBadge status={requirement.status} />
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-2 w-2 text-muted-foreground" />
                    <span className="font-mono">
                      {calcularTiempoPorEstado(requirement.statusChangedAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{requirement.pais}</Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(requirement.initialDate).toLocaleDateString('es-AR')}
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-2 w-2 text-muted-foreground" />
                    <span className="font-mono">
                      {calculateTimeElapsed(requirement.horaIngresoCorreo, requirement.initialDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-mono">
                    {requirement.baseOrigen}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{requirement.motivo}</TableCell>
                <TableCell className="text-xs">{requirement.subMotivo}</TableCell>
                <TableCell className="text-xs">
                  {requirement.assignedTo || (
                    <span className="text-muted-foreground italic">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">{requirement.nombreAsesor || '-'}</TableCell>
                <TableCell className="text-xs whitespace-nowrap" title={requirement.correoElectronico || ''}>
                  {requirement.correoElectronico || '-'}
                </TableCell>
                <TableCell className="text-xs">
                  <span className="max-w-[220px] inline-block truncate align-middle" title={requirement.comentariosAdicionales || ''}>
                    {requirement.comentariosAdicionales || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap" title={requirement.pasajeroNombreApellido || ''}>
                  {requirement.pasajeroNombreApellido || '-'}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap" title={requirement.pasajeroDocumento || ''}>
                  {requirement.pasajeroDocumento || '-'}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap" title={requirement.pasajeroCorreo || ''}>
                  {requirement.pasajeroCorreo || '-'}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {requirement.fechaVuelo ? new Date(requirement.fechaVuelo).toLocaleDateString('es-AR') : '-'}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap font-mono">{requirement.numeroVuelo || '-'}</TableCell>
                <TableCell className="text-xs whitespace-nowrap font-mono" title={requirement.tramoVuelo || ''}>
                  {requirement.tramoVuelo || '-'}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap font-mono">{requirement.vueloOperadoPor || '-'}</TableCell>
                <TableCell className="text-xs whitespace-nowrap font-mono">
                  {Number.isFinite(requirement.montoVoucherUsd) ? requirement.montoVoucherUsd : '-'}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {requirement.fechaEnvioVoucher ? new Date(requirement.fechaEnvioVoucher).toLocaleDateString('es-AR') : '-'}
                </TableCell>
                <TableCell className="text-xs">
                  <span className="max-w-[220px] inline-block truncate align-middle" title={requirement.observaciones || ''}>
                    {requirement.observaciones || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">{requirement.assignedTeam || '-'}</TableCell>
                <TableCell>
                  <RequirementPriorityBadge priority={requirement.priority} />
                </TableCell>
                <TableCell className="text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-2 w-2 text-muted-foreground" />
                    <span className="font-mono">
                      {calcularTiempoTotal(requirement.initialDate)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredAndSortedRequirements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No se encontraron requerimientos</p>
          <p className="text-sm">
            {searchTerm ? 'Intenta ajustar los filtros de búsqueda' : 'No hay requerimientos disponibles'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RequirementsTable;
