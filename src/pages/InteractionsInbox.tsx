import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRequirements } from '@/contexts/RequirementContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, ExternalLink } from 'lucide-react';
import type { RequirementInteractionPriority, RequirementInteractionStatus } from '@/types/requirement';
import type { UserRole } from '@/types/user';

const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case 'AEROPUERTO_ATO':
      return 'Aeropuerto (ATO)';
    case 'SOPORTE_CC':
      return 'Soporte CC';
    case 'SUPERVISOR':
      return 'Supervisor';
    case 'ADMINISTRADOR':
      return 'Administrador';
    default:
      return role;
  }
};

type InboxRow = {
  requirementId: string;
  ticketNumber: string;
  interactionId: string;
  type: string;
  priority: RequirementInteractionPriority;
  status: RequirementInteractionStatus;
  createdAt: Date;
  fromName: string;
  fromRole: UserRole;
  toRole: UserRole;
  title?: string;
  message: string;
};

const InteractionsInbox = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { requirements } = useRequirements();
  const [statusFilter, setStatusFilter] = useState<RequirementInteractionStatus | 'all'>('PENDIENTE');

  const isModerator = hasRole(['SUPERVISOR', 'ADMINISTRADOR']);

  const rows = useMemo<InboxRow[]>(() => {
    if (!user) return [];

    const flat: InboxRow[] = [];
    for (const req of requirements) {
      for (const it of req.interactions || []) {
        const visible =
          isModerator ||
          it.toRole === user.role ||
          it.createdByRole === user.role;

        if (!visible) continue;
        if (statusFilter !== 'all' && it.status !== statusFilter) continue;

        flat.push({
          requirementId: req.id,
          ticketNumber: req.ticketNumber,
          interactionId: it.id,
          type: it.type,
          priority: it.priority,
          status: it.status,
          createdAt: it.createdAt,
          fromName: it.createdByName,
          fromRole: it.createdByRole,
          toRole: it.toRole,
          title: it.title,
          message: it.message,
        });
      }
    }

    flat.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return flat;
  }, [requirements, user, isModerator, statusFilter]);

  const pendingCount = useMemo(() => {
    if (!user) return 0;
    return requirements.reduce((acc, req) => {
      const list = req.interactions || [];
      const count = list.filter((it) => it.status === 'PENDIENTE' && (isModerator || it.toRole === user.role)).length;
      return acc + count;
    }, 0);
  }, [requirements, user, isModerator]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Bandeja de Interacciones
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isModerator
              ? 'Seguimiento global de interacciones por caso.'
              : 'Solicitudes de información asociadas a tus casos.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Pendientes: <span className="ml-1 font-semibold">{pendingCount}</span>
          </Badge>
          <div className="min-w-[220px]">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequirementInteractionStatus | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                <SelectItem value="RESPONDIDA">Respondidas</SelectItem>
                <SelectItem value="CERRADA">Cerradas</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Interacciones ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay interacciones para mostrar con los filtros actuales.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Para</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow
                      key={`${r.requirementId}-${r.interactionId}`}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => navigate(`/requirements/${r.requirementId}`)}
                    >
                      <TableCell className="py-2">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
                          {r.ticketNumber}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="secondary" className="text-xs">
                          Solicitud de información
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={
                            r.priority === 'URGENTE'
                              ? 'border-destructive/30 text-destructive bg-destructive/10'
                              : 'border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300'
                          }
                        >
                          {r.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-xs">
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        <div className="font-medium">{r.fromName}</div>
                        <div className="text-muted-foreground">{getRoleLabel(r.fromRole)}</div>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {getRoleLabel(r.toRole)}
                      </TableCell>
                      <TableCell className="py-2 text-xs whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        <div className="font-medium">{r.title || '-'}</div>
                        <div className="text-muted-foreground line-clamp-2">{r.message}</div>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ExternalLink className="h-4 w-4" />
                          Ver
                        </Button>
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

export default InteractionsInbox;

