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
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('initialDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
          'Estado Final'
        ],
        // Datos
        ...filteredAndSortedRequirements.map(req => [
          req.ticketNumber,
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
              placeholder="Buscar por número, PNR, solicitante..."
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
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-xs"
                onClick={() => handleSort('ticketNumber')}
              >
                <div className="flex items-center gap-1">
                  Número
                  {getSortIcon('ticketNumber')}
                </div>
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
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">{requirement.ticketNumber}</Badge>
                    <ExternalLink className="h-2 w-2 text-muted-foreground" />
                  </div>
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
