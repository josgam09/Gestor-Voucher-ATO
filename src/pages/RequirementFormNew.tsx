import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequirements } from '@/contexts/RequirementContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


import { ArrowLeft, Clock, Mail, User, Globe, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import DuplicateCaseModal from '@/components/DuplicateCaseModal';
import { Requirement, RequirementStatus } from '@/types/requirement';
import { 
  Pais, 
  BaseOrigen,
  VueloOperadoPor
} from '@/types/requirement';

const RequirementFormNew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addRequirement, updateRequirement, getRequirement, requirements, findDuplicateCases } = useRequirements();
  const { user, hasRole } = useAuth();

  // Estados para casos duplicados
  const [duplicateCases, setDuplicateCases] = useState<Requirement[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  const isEditing = !!id;
  const existingRequirement = isEditing && id ? getRequirement(id) : undefined;

  // Generar número único del ticket (solo para nuevos)
  const generateTicketNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = requirements.length + 1;
    return `VO_ATO-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const ticketNumber = existingRequirement?.ticketNumber || generateTicketNumber();

  // Sección 1: Información Personal de Aeropuerto
  const [nombreSolicitante, setNombreSolicitante] = useState('');
  const [fechaHoraIngresoSolicitud, setFechaHoraIngresoSolicitud] = useState<Date>(() => new Date());
  const [correoSolicitante, setCorreoSolicitante] = useState('');

  // Aeropuerto (ATO): sugerir datos del usuario (pero editable)
  useEffect(() => {
    if (user?.role !== 'AEROPUERTO_ATO') return;
    if (isEditing) return;

    // Solo sugerir si aún no se ha escrito nada (evita sobreescribir)
    if (!nombreSolicitante.trim()) setNombreSolicitante(user.name);
    if (!correoSolicitante.trim()) setCorreoSolicitante(user.email);
  }, [user, isEditing, nombreSolicitante, correoSolicitante]);

  // Si es edición, precargar datos
  useEffect(() => {
    if (!isEditing) return;
    if (!existingRequirement) {
      toast.error('Requerimiento no encontrado');
      navigate('/requirements');
      return;
    }

    // Permisos de edición:
    // - ATO: solo puede editar SUS casos si están en estado "ingresado"
    // - Supervisor/Admin: pueden editar
    if (user?.role === 'AEROPUERTO_ATO') {
      const isOwner = existingRequirement.nombreAsesor === user.name;
      const canEditNow = existingRequirement.status === 'ingresado';
      if (!isOwner || !canEditNow) {
        toast.error('No tienes permisos para editar este requerimiento (solo tus casos en estado Ingresado).');
        navigate(`/requirements/${existingRequirement.id}`);
        return;
      }
    } else if (!hasRole(['SUPERVISOR', 'ADMINISTRADOR'])) {
      toast.error('No tienes permisos para editar este requerimiento.');
      navigate(`/requirements/${existingRequirement.id}`);
      return;
    }

    setNombreSolicitante(existingRequirement.nombreAsesor || '');
    setCorreoSolicitante(existingRequirement.correoElectronico || '');
    setPais((existingRequirement.pais as Pais) || '');
    setBaseOrigen((existingRequirement.baseOrigen as BaseOrigen) || '');
    setPnrTktLocalizador(existingRequirement.pnrTktLocalizador || '');

    setPasajeroNombreApellido(existingRequirement.pasajeroNombreApellido || '');
    setPasajeroDocumento(existingRequirement.pasajeroDocumento || '');
    setPasajeroCorreo(existingRequirement.pasajeroCorreo || '');
    setFechaVuelo(existingRequirement.fechaVuelo ? new Date(existingRequirement.fechaVuelo).toISOString().slice(0, 10) : '');
    setNumeroVuelo(existingRequirement.numeroVuelo || '');
    setTramoVuelo(existingRequirement.tramoVuelo || '');
    setVueloOperadoPor((existingRequirement.vueloOperadoPor as VueloOperadoPor) || '');

    setMotivo(existingRequirement.motivo || '');
    setSubMotivo(existingRequirement.subMotivo || '');
    setComentariosAdicionales(existingRequirement.comentariosAdicionales || '');

    setMontoVoucherUsd(
      typeof existingRequirement.montoVoucherUsd === 'number'
        ? String(existingRequirement.montoVoucherUsd)
        : ''
    );

    // Mantener fecha/hora de ingreso (solo lectura)
    setFechaHoraIngresoSolicitud(existingRequirement.createdAt ? new Date(existingRequirement.createdAt) : new Date());
  }, [isEditing, existingRequirement, user, hasRole, navigate]);

  // Sección 2: Origen de la Solicitud
  const [pais, setPais] = useState<Pais | ''>('');
  const [baseOrigen, setBaseOrigen] = useState<BaseOrigen | ''>('');

  // Sección 3: Datos del Pasajero y Vuelo
  const [pnrTktLocalizador, setPnrTktLocalizador] = useState('');
  const [pasajeroNombreApellido, setPasajeroNombreApellido] = useState('');
  const [pasajeroDocumento, setPasajeroDocumento] = useState('');
  const [pasajeroCorreo, setPasajeroCorreo] = useState('');
  const [fechaVuelo, setFechaVuelo] = useState(''); // yyyy-mm-dd
  const [numeroVuelo, setNumeroVuelo] = useState('');
  const [tramoVuelo, setTramoVuelo] = useState('');
  const [vueloOperadoPor, setVueloOperadoPor] = useState<VueloOperadoPor | ''>('');

  // Sección 4: Motivo y Sub Motivo de la Solicitud de Voucher
  const [motivo, setMotivo] = useState('');
  const [subMotivo, setSubMotivo] = useState('');

  // Sección 5: Información del Voucher
  const [montoVoucherUsd, setMontoVoucherUsd] = useState(''); // input numérico (string)

  // Campos adicionales
  const [comentariosAdicionales, setComentariosAdicionales] = useState('');

  // Listas de opciones
  const paises: Pais[] = ['AR', 'BR', 'CL', 'CO', 'DO', 'EC', 'PE', 'PY', 'UY'];

  const basesPorPais: Record<Pais, BaseOrigen[]> = {
    AR: ['EZE', 'AEP', 'CRD', 'COR', 'FTE', 'MDZ', 'NQN', 'RES', 'SLA', 'BRC', 'CPC', 'TUC', 'REL', 'IGR', 'USH'],
    BR: ['GIG', 'GRU', 'FLN', 'IGU', 'NAT', 'REC'],
    CL: ['SCL', 'ANF', 'ARI', 'BBA', 'CJC', 'CCP', 'IQQ', 'LSC', 'PMC', 'ZCO'],
    CO: ['BAQ', 'BOG', 'CLO', 'CTG', 'CUC', 'MDE', 'MTR', 'PEI', 'ADZ', 'SMR'],
    DO: ['PUJ'],
    EC: ['UIO'],
    PE: ['LIM', 'AQP', 'CJA', 'CIX', 'CUZ', 'PIU', 'TPP', 'TRU'],
    PY: ['ASU'],
    UY: ['MVD'],
  };

  const motivosVoucher = ['OVBK Operacional', 'OVBK Comercial'] as const;
  const subMotivosVoucher = ['Voluntario', 'Involuntario'] as const;

  // Resetear sub motivo cuando cambia el motivo
  useEffect(() => {
    setSubMotivo('');
  }, [motivo]);

  // Verificar duplicados cuando cambie el PNR
  useEffect(() => {
    if (pnrTktLocalizador && pnrTktLocalizador.trim() !== '') {
      setDuplicateCases(findDuplicateCases(pnrTktLocalizador));
      return;
    }
    setDuplicateCases([]);
  }, [pnrTktLocalizador, findDuplicateCases]);

  // Función para continuar con la creación del caso
  const continueWithCreation = () => {
    setShowDuplicateModal(false);
    setPendingSubmission(true);
    // Ejecutar el submit después de cerrar el modal
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Si hay casos duplicados y no es una submissión pendiente, mostrar el modal
    if (duplicateCases.length > 0 && !pendingSubmission) {
      setShowDuplicateModal(true);
      return;
    }

    // Resetear el flag de submissión pendiente
    setPendingSubmission(false);

    // Validaciones básicas
    if (!nombreSolicitante || !correoSolicitante) {
      toast.error('Por favor complete todos los campos de la Sección 1');
      return;
    }

    const email = correoSolicitante.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      toast.error('Ingrese un correo electrónico del solicitante válido');
      return;
    }

    const now = new Date();
    const horaIngresoSolicitud = isEditing && existingRequirement
      ? existingRequirement.horaIngresoCorreo
      : now.toTimeString().slice(0, 5); // HH:MM
    const initialDateFinal = isEditing && existingRequirement ? existingRequirement.initialDate : now;

    if (!pais || !baseOrigen) {
      toast.error('Por favor complete todos los campos de la Sección 2');
      return;
    }

    if (!pnrTktLocalizador) {
      toast.error('Por favor complete el campo Código de Reserva (PNR)');
      return;
    }

    const pnr = pnrTktLocalizador.trim().toUpperCase();
    const isValidPNR = /^[A-Z][A-Z0-9]{4}[A-Z]$/.test(pnr);
    if (!isValidPNR) {
      toast.error('El Código de Reserva (PNR) debe ser alfanumérico de 6 caracteres, comenzar y terminar con una letra.');
      return;
    }

    if (!pasajeroNombreApellido.trim() || !pasajeroDocumento.trim() || !pasajeroCorreo.trim()) {
      toast.error('Por favor complete todos los campos de Datos del Pasajero');
      return;
    }

    const passengerEmail = pasajeroCorreo.trim();
    const isValidPassengerEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerEmail);
    if (!isValidPassengerEmail) {
      toast.error('Ingrese un correo electrónico del pasajero válido');
      return;
    }

    if (!fechaVuelo || !numeroVuelo.trim() || !tramoVuelo.trim() || !vueloOperadoPor) {
      toast.error('Por favor complete todos los campos de Datos del Vuelo');
      return;
    }

    if (!motivo || !subMotivo) {
      toast.error('Por favor complete todos los campos de la Sección 4');
      return;
    }

    const montoParsed = Number(String(montoVoucherUsd).replace(',', '.'));
    const isValidMonto = Number.isFinite(montoParsed) && montoParsed > 0;
    if (!isValidMonto) {
      toast.error('Por favor ingrese un Monto del Voucher (USD) válido (mayor que 0)');
      return;
    }

    // Flujo Multi-Rol:
    // - Nuevo: estado "Ingresado"
    // - Edición: mantener estado actual
    const estadoFinal: RequirementStatus = isEditing && existingRequirement ? existingRequirement.status : 'ingresado';

    const payloadBase: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'history'> = {
      ticketNumber, // Usar el número generado
      nombreAsesor: nombreSolicitante.trim(),
      horaIngresoCorreo: horaIngresoSolicitud,
      correoElectronico: email,
      pais: pais as Pais,
      baseOrigen: baseOrigen as BaseOrigen,
      pnrTktLocalizador: pnr,
      pasajeroNombreApellido: pasajeroNombreApellido.trim(),
      pasajeroDocumento: pasajeroDocumento.trim(),
      pasajeroCorreo: passengerEmail,
      fechaVuelo: new Date(`${fechaVuelo}T00:00:00`),
      numeroVuelo: numeroVuelo.trim(),
      tramoVuelo: tramoVuelo.trim(),
      vueloOperadoPor: vueloOperadoPor as VueloOperadoPor,
      motivo,
      subMotivo,
      comentariosAdicionales: comentariosAdicionales.trim() ? comentariosAdicionales.trim() : undefined,
      montoVoucherUsd: montoParsed,
      status: estadoFinal,
      priority: 'media' as const,
      initialDate: initialDateFinal,
    };

    if (isEditing && existingRequirement) {
      updateRequirement(existingRequirement.id, payloadBase);
      toast.success('Requerimiento actualizado exitosamente');
      navigate(`/requirements/${existingRequirement.id}`);
      return;
    }

    addRequirement(payloadBase);
    toast.success('Requerimiento ingresado exitosamente');
    navigate('/requirements');
  };

  return (
    <div className="container mx-auto py-4 space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/requirements')} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Editar Requerimiento' : 'Nuevo Requerimiento'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Número de Ticket */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-primary" />
                <span className="text-sm font-medium text-primary">Ticket:</span>
                <div className="bg-primary/10 border border-primary/20 rounded px-2 py-1">
                  <span className="text-primary text-sm font-semibold tracking-wide">
                    {ticketNumber}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded text-xs">
                  Generado automáticamente
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 1: Información Personal de Aeropuerto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Sección 1: Información Personal de Aeropuerto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombreSolicitante">Nombre y Apellido del Solicitante *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombreSolicitante"
                    value={nombreSolicitante}
                    onChange={(e) => setNombreSolicitante(e.target.value)}
                    className="pl-10"
                    placeholder="Ingrese nombre y apellido"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaHoraIngresoSolicitud">Fecha y Hora de Ingreso Solicitud</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fechaHoraIngresoSolicitud"
                    value={fechaHoraIngresoSolicitud.toLocaleString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correoSolicitante">Correo Electrónico del Solicitante *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    id="correoSolicitante"
                    value={correoSolicitante}
                    onChange={(e) => setCorreoSolicitante(e.target.value)}
                    placeholder="nombre@dominio.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Origen de la Solicitud */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Sección 2: Origen de la Solicitud
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <Select
                  value={pais}
                  onValueChange={(value) => {
                    setPais(value as Pais);
                    setBaseOrigen('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {paises.map((paisOption) => (
                      <SelectItem key={paisOption} value={paisOption}>
                        {paisOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseOrigen">Base Origen *</Label>
                <Select
                  value={baseOrigen}
                  onValueChange={(value) => setBaseOrigen(value as BaseOrigen)}
                  disabled={!pais}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={pais ? "Seleccione una base" : "Seleccione país primero"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(pais ? basesPorPais[pais as Pais] : []).map((base) => (
                      <SelectItem key={base} value={base}>
                        {base}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 3: Datos del Pasajero y Vuelo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Sección 3: Datos del Pasajero y Vuelo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="rounded-md border border-brand-red-200 bg-brand-red-100/40 p-3 text-sm text-brand-red-800">
              Nota: Si hay varios pasajeros en la reserva, debe ingresarse uno a uno.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pnrTktLocalizador">Código de Reserva (PNR) *</Label>
                <div className="relative">
                  <Input
                    id="pnrTktLocalizador"
                    value={pnrTktLocalizador}
                    onChange={(e) => setPnrTktLocalizador(e.target.value.toUpperCase())}
                    placeholder="Ej: ABC12D"
                    className={duplicateCases.length > 0 ? "border-orange-500 focus:border-orange-500" : ""}
                    inputMode="text"
                    maxLength={6}
                    required
                  />
                  {duplicateCases.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Debe ser alfanumérico de 6 caracteres, comenzar y terminar con una letra.
                </p>
                {duplicateCases.length > 0 && (
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Se encontraron {duplicateCases.length} caso(s) existente(s) con este Código de Reserva (PNR)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pasajeroNombreApellido">Nombre y Apellido del Pasajero *</Label>
                <Input
                  id="pasajeroNombreApellido"
                  value={pasajeroNombreApellido}
                  onChange={(e) => setPasajeroNombreApellido(e.target.value)}
                  placeholder="Nombre Apellido"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pasajeroDocumento">RUT / DNI / PASAPORTE *</Label>
                <Input
                  id="pasajeroDocumento"
                  value={pasajeroDocumento}
                  onChange={(e) => setPasajeroDocumento(e.target.value)}
                  placeholder="Documento"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pasajeroCorreo">Correo Electrónico del Pasajero *</Label>
                <Input
                  id="pasajeroCorreo"
                  type="email"
                  value={pasajeroCorreo}
                  onChange={(e) => setPasajeroCorreo(e.target.value)}
                  placeholder="pasajero@dominio.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaVuelo">Fecha del Vuelo *</Label>
                <Input
                  id="fechaVuelo"
                  type="date"
                  value={fechaVuelo}
                  onChange={(e) => setFechaVuelo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroVuelo">N° de Vuelo *</Label>
                <Input
                  id="numeroVuelo"
                  value={numeroVuelo}
                  onChange={(e) => setNumeroVuelo(e.target.value)}
                  placeholder="Ej: 1234"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tramoVuelo">Tramo del Vuelo *</Label>
                <Input
                  id="tramoVuelo"
                  value={tramoVuelo}
                  onChange={(e) => setTramoVuelo(e.target.value.toUpperCase())}
                  placeholder="Ej: SCL-LIM"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vueloOperadoPor">Vuelo Operado por *</Label>
                <Select value={vueloOperadoPor} onValueChange={(value) => setVueloOperadoPor(value as VueloOperadoPor)}>
                  <SelectTrigger id="vueloOperadoPor">
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">JA</SelectItem>
                    <SelectItem value="WJ">WJ</SelectItem>
                    <SelectItem value="JZ">JZ</SelectItem>
                    <SelectItem value="J6">J6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 4: Motivo y Sub Motivo de la Solicitud de Voucher */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4" />
              Sección 4: Motivo y Sub Motivo de la Solicitud de Voucher
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo *</Label>
                <Select value={motivo} onValueChange={setMotivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosVoucher.map((motivoOption) => (
                      <SelectItem key={motivoOption} value={motivoOption}>
                        {motivoOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subMotivo">Sub Motivo *</Label>
                <Select value={subMotivo} onValueChange={setSubMotivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione sub motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {subMotivosVoucher.map((subMotivoOption) => (
                      <SelectItem key={subMotivoOption} value={subMotivoOption}>
                        {subMotivoOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentariosAdicionales">Comentarios adicionales</Label>
              <Textarea
                id="comentariosAdicionales"
                value={comentariosAdicionales}
                onChange={(e) => setComentariosAdicionales(e.target.value)}
                placeholder="Ingresa comentarios adicionales..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 5: Información del Voucher */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sección 5: Información del Voucher</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Label htmlFor="montoVoucherUsd">Monto del Voucher (USD) *</Label>
              <Input
                id="montoVoucherUsd"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={montoVoucherUsd}
                onChange={(e) => setMontoVoucherUsd(e.target.value)}
                placeholder="Ej: 100"
                required
              />
              <p className="text-xs text-muted-foreground">Moneda del Voucher: USD</p>
            </div>

            <div className="mt-4 rounded-md border bg-muted/30 p-3 text-sm">
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
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => navigate('/requirements')}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" className="gap-2">
            {isEditing ? 'Guardar cambios' : 'Crear Requerimiento'}
          </Button>
        </div>
      </form>

      {/* Modal de casos duplicados */}
      <DuplicateCaseModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        duplicateCases={duplicateCases}
        pnrTktLocalizador={pnrTktLocalizador}
        onContinue={continueWithCreation}
      />
    </div>
  );
};

export default RequirementFormNew;
