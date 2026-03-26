import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRequirements } from '@/contexts/RequirementContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RequirementStatusBadge from '@/components/RequirementStatusBadge';
import RequirementPriorityBadge from '@/components/RequirementPriorityBadge';
import { ArrowLeft, Home, Mail, User, Calendar, Clock, Server, CheckCircle2, Eye, MessageSquare, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/types/user';
import type { RequirementInteractionPriority } from '@/types/requirement';

const RequirementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRequirement, updateRequirement, addInteraction, respondInteraction, closeInteraction } = useRequirements();

  const [fechaEnvioVoucherInput, setFechaEnvioVoucherInput] = useState(''); // yyyy-mm-dd
  const [interactionPriority, setInteractionPriority] = useState<RequirementInteractionPriority>('NORMAL');
  const [interactionToRole, setInteractionToRole] = useState<UserRole>('SOPORTE_CC');
  const [interactionTitle, setInteractionTitle] = useState('');
  const [interactionMessage, setInteractionMessage] = useState('');
  const [interactionResponses, setInteractionResponses] = useState<Record<string, string>>({});

  const requirement = id ? getRequirement(id) : undefined;

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

  const initInteractionToRole = (currentRole?: UserRole) => {
    if (!currentRole) return;
    if (currentRole === 'AEROPUERTO_ATO') {
      setInteractionToRole('SOPORTE_CC');
    } else if (currentRole === 'SOPORTE_CC') {
      setInteractionToRole('AEROPUERTO_ATO');
    }
  };

  const canModerate = !!user && (user.role === 'ADMINISTRADOR' || user.role === 'SUPERVISOR');

  const canCreateInteractions =
    !!user && (user.role === 'AEROPUERTO_ATO' || user.role === 'SOPORTE_CC' || user.role === 'ADMINISTRADOR');

  const handleCreateInteraction = () => {
    if (!requirement || !user) return;
    if (!canCreateInteractions) {
      toast.error('Tu perfil no puede crear interacciones');
      return;
    }
    if (!interactionMessage.trim()) {
      toast.error('Ingresa el detalle de la interacción');
      return;
    }

    addInteraction(requirement.id, {
      type: 'SOLICITUD_INFO',
      priority: interactionPriority,
      createdByName: user.name,
      createdByRole: user.role,
      toRole: interactionToRole,
      title: interactionTitle.trim() ? interactionTitle.trim() : undefined,
      message: interactionMessage.trim(),
    });

    toast.success('Interacción creada');
    setInteractionTitle('');
    setInteractionMessage('');
    setInteractionPriority('NORMAL');
    initInteractionToRole(user.role);
  };

  const handleRespondInteraction = (interactionId: string) => {
    if (!requirement || !user) return;
    if (!(user.role === 'AEROPUERTO_ATO' || user.role === 'SOPORTE_CC' || user.role === 'ADMINISTRADOR')) {
      toast.error('Tu perfil no puede responder interacciones');
      return;
    }
    const responseMessage = (interactionResponses[interactionId] || '').trim();
    if (!responseMessage) {
      toast.error('Ingresa una respuesta');
      return;
    }

    respondInteraction(requirement.id, interactionId, {
      respondedByName: user.name,
      respondedByRole: user.role,
      responseMessage,
    });

    toast.success('Respuesta enviada');
    setInteractionResponses((prev) => ({ ...prev, [interactionId]: '' }));
  };

  const handleCloseInteraction = (interactionId: string) => {
    if (!requirement || !user) return;
    if (!(user.role === 'ADMINISTRADOR')) {
      toast.error('Solo el Administrador puede cerrar interacciones');
      return;
    }
    closeInteraction(requirement.id, interactionId, {
      closedByName: user.name,
      closedByRole: user.role,
    });
    toast.success('Interacción cerrada');
  };

  useEffect(() => {
    initInteractionToRole(user?.role);
  }, [user?.role]);

  const handleMarkEnGestion = () => {
    if (!requirement || !user) return;
    if (user.role !== 'SOPORTE_CC') {
      toast.error('No tienes permisos para cambiar el estado');
      return;
    }
    if (requirement.status !== 'ingresado') return;

    updateRequirement(requirement.id, {
      status: 'en-gestion',
      assignedTeam: 'Soporte CC',
      assignedTo: user.name,
      history: [
        ...requirement.history,
        {
          id: Date.now().toString(),
          date: new Date(),
          action: 'Caso en gestión',
          user: user.name,
          comment: 'Gestión individual por Soporte CC',
        },
      ],
    });

    toast.success('Caso marcado como EN GESTIÓN');
  };

  const handleMarkVoucherAsSent = () => {
    if (!requirement || !user) return;
    if (user.role !== 'SOPORTE_CC') {
      toast.error('No tienes permisos para marcar el voucher como enviado');
      return;
    }
    if (requirement.status !== 'en-gestion') {
      toast.error('El caso debe estar en EN GESTIÓN para marcarse como enviado');
      return;
    }
    if (!fechaEnvioVoucherInput) {
      toast.error('Por favor ingresa la fecha de envío del voucher');
      return;
    }

    const fechaEnvio = new Date(`${fechaEnvioVoucherInput}T00:00:00`);

    updateRequirement(requirement.id, {
      status: 'enviado',
      fechaEnvioVoucher: fechaEnvio,
      resolvedAt: fechaEnvio,
      assignedTeam: 'Soporte CC',
      assignedTo: user.name,
      history: [
        ...requirement.history,
        {
          id: Date.now().toString(),
          date: new Date(),
          action: 'Caso Cerrado por envío de Voucher por Parte de Soporte CC',
          user: user.name,
          comment: `Fecha de envío: ${fechaEnvioVoucherInput}`,
        },
      ],
    });

    toast.success('Caso marcado como ENVIADO (cerrado)');
  };

  if (!requirement) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Inicio
          </Button>
          <Button onClick={() => navigate('/requirements')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Requerimientos
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Requerimiento no encontrado</p>
              <Button onClick={() => navigate('/')}>Volver al Inicio</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit =
    !!user &&
    (user.role === 'ADMINISTRADOR' ||
      (user.role === 'AEROPUERTO_ATO' &&
        requirement.nombreAsesor === user.name &&
        requirement.status === 'ingresado'));

  const interactions = requirement.interactions || [];
  const availableToRoles: UserRole[] = (() => {
    if (!user) return ['SOPORTE_CC'];
    if (user.role === 'AEROPUERTO_ATO') return ['SOPORTE_CC'];
    if (user.role === 'SOPORTE_CC') return ['AEROPUERTO_ATO'];
    return ['AEROPUERTO_ATO', 'SOPORTE_CC'];
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Inicio
          </Button>
          <Button onClick={() => navigate('/requirements')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Requerimientos
          </Button>
        </div>
        {canEdit && (
          <Link to={`/requirements/${requirement.id}/edit`}>
            <Button>Editar Requerimiento</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono">
                    {requirement.ticketNumber}
                  </Badge>
                  <Badge variant="outline">{requirement.baseOrigen}</Badge>
                </div>
                <CardTitle className="text-2xl">{requirement.motivo || 'Solicitud Voucher'}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <RequirementStatusBadge status={requirement.status} />
                  <RequirementPriorityBadge priority={requirement.priority} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Código de Reserva (PNR)</h3>
                  <p className="text-muted-foreground font-mono">{requirement.pnrTktLocalizador}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sección 2: Origen de la Solicitud</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">País:</span> {requirement.pais}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Base Origen:</span> {requirement.baseOrigen}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Datos del Pasajero y Vuelo</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {requirement.pasajeroNombreApellido && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Pasajero</h4>
                      <p className="text-muted-foreground">{requirement.pasajeroNombreApellido}</p>
                    </div>
                  )}
                  {requirement.pasajeroDocumento && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">RUT / DNI / PASAPORTE</h4>
                      <p className="text-muted-foreground">{requirement.pasajeroDocumento}</p>
                    </div>
                  )}
                  {requirement.pasajeroCorreo && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Correo del Pasajero</h4>
                      <p className="text-muted-foreground">{requirement.pasajeroCorreo}</p>
                    </div>
                  )}
                  {requirement.fechaVuelo && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Fecha del Vuelo</h4>
                      <p className="text-muted-foreground">
                        {new Date(requirement.fechaVuelo).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  )}
                  {requirement.numeroVuelo && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">N° de Vuelo</h4>
                      <p className="text-muted-foreground">{requirement.numeroVuelo}</p>
                    </div>
                  )}
                  {requirement.tramoVuelo && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Tramo del Vuelo</h4>
                      <p className="text-muted-foreground font-mono">{requirement.tramoVuelo}</p>
                    </div>
                  )}
                  {requirement.vueloOperadoPor && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Vuelo Operado por</h4>
                      <p className="text-muted-foreground font-mono">{requirement.vueloOperadoPor}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Sección 4: Motivo y Sub Motivo de la Solicitud de Voucher</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Motivo</h4>
                    <p className="text-muted-foreground">{requirement.motivo || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Sub Motivo</h4>
                    <p className="text-muted-foreground">{requirement.subMotivo || '-'}</p>
                  </div>
                  {requirement.comentariosAdicionales && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium mb-1">Comentarios adicionales</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{requirement.comentariosAdicionales}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-2">Sección 5: Información del Voucher</h3>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Monto:</span> {requirement.montoVoucherUsd} USD
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Moneda:</span> USD
                  </p>
                  {requirement.fechaEnvioVoucher && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Fecha de envío:</span>{' '}
                      {new Date(requirement.fechaEnvioVoucher).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>

                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="font-semibold mb-2">Condiciones del Voucher</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>El Voucher no paga tasas de embarque.</li>
                    <li>Es sólo para compra de servicios JetSMART.</li>
                    <li>No paga servicios de comida o bebida a bordo del avión.</li>
                    <li>Es válido por 180 días desde su emisión.</li>
                    <li>
                      Si utilizas tu Voucher y te queda saldo a favor, podrás utilizar ese saldo en una futura compra dentro del período
                      de validez; posterior a este expirará y quedará sin valor.
                    </li>
                    <li>El Voucher no es reembolsable, ni redimible en dinero y no es acumulable.</li>
                    <li>Todo Voucher es al portador; por lo mismo es responsabilidad del cliente el debido uso y custodia de éste.</li>
                  </ul>
                </div>

                {/* Acciones Soporte CC */}
                {user?.role === 'SOPORTE_CC' && requirement.status === 'ingresado' && (
                  <div className="rounded-md border p-3 space-y-3">
                    <p className="font-semibold flex items-center gap-2">
                      <Eye className="h-4 w-4" /> Gestión individual
                    </p>
                    <Button onClick={handleMarkEnGestion} className="w-full">
                      Marcar como EN GESTIÓN
                    </Button>
                  </div>
                )}

                {user?.role === 'SOPORTE_CC' && requirement.status === 'en-gestion' && (
                  <div className="rounded-md border p-3 space-y-3">
                    <p className="font-semibold">Envío de Voucher</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fechaEnvioVoucher">Fecha de envío *</Label>
                        <Input
                          id="fechaEnvioVoucher"
                          type="date"
                          value={fechaEnvioVoucherInput}
                          onChange={(e) => setFechaEnvioVoucherInput(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleMarkVoucherAsSent} className="w-full">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar como ENVIADO (Cerrar)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {requirement.observaciones && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Observaciones</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{requirement.observaciones}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Interacciones del caso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <CircleAlert className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Crea <span className="font-medium">solicitudes de información</span> asociadas a este caso. Quedarán marcadas como
                    pendientes hasta que se respondan y/o cierren.
                  </p>
                </div>

                {!canCreateInteractions && (
                  <div className="text-sm text-muted-foreground">
                    Vista de seguimiento: tu rol no crea ni responde interacciones.
                  </div>
                )}

                {canCreateInteractions && (
                  <>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Input value="Solicitud de información" disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Prioridad</Label>
                    <Select value={interactionPriority} onValueChange={(v) => setInteractionPriority(v as RequirementInteractionPriority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="URGENTE">Urgente</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Para</Label>
                    <Select value={interactionToRole} onValueChange={(v) => setInteractionToRole(v as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableToRoles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {getRoleLabel(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Título (opcional)</Label>
                  <Input
                    value={interactionTitle}
                    onChange={(e) => setInteractionTitle(e.target.value)}
                    placeholder="Ej: Validar datos de pasajero"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Detalle *</Label>
                  <Textarea
                    value={interactionMessage}
                    onChange={(e) => setInteractionMessage(e.target.value)}
                    placeholder="Escribe aquí la solicitud/tarea/escalamiento..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleCreateInteraction}>
                    Crear interacción
                  </Button>
                </div>
                  </>
                )}
              </div>

              {interactions.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No hay interacciones registradas aún.
                </div>
              ) : (
                <div className="space-y-3">
                  {interactions.map((it) => {
                    const pendingForUser = it.status === 'PENDIENTE';
                    const canRespond =
                      it.status === 'PENDIENTE' &&
                      !!user &&
                      (user.role === 'AEROPUERTO_ATO' || user.role === 'SOPORTE_CC' || user.role === 'ADMINISTRADOR') &&
                      (user.role === 'ADMINISTRADOR' || it.toRole === user.role);
                    const canClose =
                      !!user &&
                      it.status !== 'CERRADA' &&
                      user.role === 'ADMINISTRADOR';

                    return (
                      <div key={it.id} className="rounded-md border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">Solicitud de información</Badge>
                            <Badge
                              variant="outline"
                              className={
                                it.priority === 'URGENTE'
                                  ? 'border-destructive/30 text-destructive bg-destructive/10'
                                  : 'border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300'
                              }
                            >
                              {it.priority}
                            </Badge>
                            <Badge variant="outline">{it.status}</Badge>
                            {pendingForUser && (
                              <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline">
                                Pendiente
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(it.createdAt).toLocaleString('es-AR')}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          De <span className="font-medium">{it.createdByName}</span> ({getRoleLabel(it.createdByRole)}) → Para{' '}
                          <span className="font-medium">{getRoleLabel(it.toRole)}</span>
                        </div>

                        {it.title && <p className="text-sm font-medium">{it.title}</p>}
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{it.message}</p>

                        {it.responseMessage && (
                          <div className="rounded-md bg-muted/30 p-3 space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Respuesta de{' '}
                              <span className="font-medium">{it.respondedByName || 'N/A'}</span>{' '}
                              {it.respondedByRole ? `(${getRoleLabel(it.respondedByRole)})` : ''}{' '}
                              {it.respondedAt ? `· ${new Date(it.respondedAt).toLocaleString('es-AR')}` : ''}
                            </p>
                            <p className="text-sm whitespace-pre-wrap">{it.responseMessage}</p>
                          </div>
                        )}

                        {canRespond && (
                          <div className="grid gap-2">
                            <Label className="text-xs">Responder</Label>
                            <Textarea
                              value={interactionResponses[it.id] || ''}
                              onChange={(e) =>
                                setInteractionResponses((prev) => ({ ...prev, [it.id]: e.target.value }))
                              }
                              placeholder="Escribe la respuesta..."
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="secondary" onClick={() => handleRespondInteraction(it.id)}>
                                Responder
                              </Button>
                            </div>
                          </div>
                        )}

                        {(canRespond || canClose) && (
                          <div className="flex justify-end gap-2 pt-1">
                            {canClose && (
                              <Button variant="outline" onClick={() => handleCloseInteraction(it.id)}>
                                Cerrar
                              </Button>
                            )}
                          </div>
                        )}

                        {it.closedAt && (
                          <p className="text-xs text-muted-foreground">
                            Cerrado por <span className="font-medium">{it.closedByName || 'N/A'}</span>{' '}
                            {it.closedByRole ? `(${getRoleLabel(it.closedByRole)})` : ''}{' '}
                            · {new Date(it.closedAt).toLocaleString('es-AR')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirement.history.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      {index < requirement.history.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{entry.action}</p>
                          <p className="text-sm text-muted-foreground">por {entry.user}</p>
                          {entry.comment && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.comment}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(entry.date).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Solicitante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Aeropuerto (ATO)</p>
                  <p className="font-medium">{requirement.nombreAsesor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{requirement.correoElectronico}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Requerimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hora de Ingreso</p>
                  <p className="font-medium">{requirement.horaIngresoCorreo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium">{new Date(requirement.createdAt).toLocaleString('es-AR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Última Actualización</p>
                  <p className="font-medium">{new Date(requirement.updatedAt).toLocaleString('es-AR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Equipo Asignado</p>
                  <p className="font-medium">
                    {requirement.assignedTeam || (requirement.status === 'ingresado' ? 'Pendiente Soporte CC' : 'Soporte CC')}
                  </p>
                </div>
              </div>
              {requirement.resolvedAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Cierre</p>
                    <p className="font-medium text-success">
                      {new Date(requirement.resolvedAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequirementDetail;
