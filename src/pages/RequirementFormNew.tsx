import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequirements } from '@/contexts/RequirementContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Clock, Mail, User, Globe, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ScriptSelector from '@/components/ScriptSelector';
import DuplicateCaseModal from '@/components/DuplicateCaseModal';
import { getApplicableScripts, ResponseScript } from '@/data/responseScripts';
import { Requirement } from '@/types/requirement';
import { 
  AsesorName, 
  Pais, 
  OrigenConsulta, 
  TipoSolicitud,
  MotivoSolicitud,
  MotivoReclamo,
  CasoOpcion,
  AreaEscalamiento
} from '@/types/requirement';

const RequirementFormNew = () => {
  const navigate = useNavigate();
  const { addRequirement, requirements, findDuplicateCases } = useRequirements();

  // Estados para casos duplicados
  const [duplicateCases, setDuplicateCases] = useState<Requirement[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  // Generar número único del ticket
  const generateTicketNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = requirements.length + 1;
    return `GDS-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const ticketNumber = generateTicketNumber();

  // Sección 1: Información del Asesor
  const [nombreAsesor, setNombreAsesor] = useState<AsesorName | ''>('');
  const [horaIngresoCorreo, setHoraIngresoCorreo] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [asuntoCorreoElectronico, setAsuntoCorreoElectronico] = useState('');

  // Sección 2: Origen de Consulta
  const [pais, setPais] = useState<Pais | ''>('');
  const [origenConsulta, setOrigenConsulta] = useState<OrigenConsulta | ''>('');
  const [esSoporteIngles, setEsSoporteIngles] = useState('No');

  // Sección 3: Datos del Cliente
  const [pnrTktLocalizador, setPnrTktLocalizador] = useState('');

  // Sección 4: Clasificación
  const [tipoSolicitud, setTipoSolicitud] = useState<TipoSolicitud | ''>('');
  const [motivo, setMotivo] = useState('');
  const [subMotivo, setSubMotivo] = useState('');
  const [subMotivoOtros, setSubMotivoOtros] = useState('');

  // Campos adicionales
  const [solicitudCliente, setSolicitudCliente] = useState('');
  const [casoOpcion, setCasoOpcion] = useState<CasoOpcion>('SI_CERRAR_CASO');
  const [escaladoA, setEscaladoA] = useState('');
  const [areaEscalamiento, setAreaEscalamiento] = useState<AreaEscalamiento | ''>('');
  const [analisisAnalista, setAnalisisAnalista] = useState('');
  const [informacionBrindada, setInformacionBrindada] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [availableScripts, setAvailableScripts] = useState<ResponseScript[]>([]);

  // Listas de opciones
  const asesores: AsesorName[] = [
    'Jenny Andrea Taborda', 'Jhoan Restrepo', 'José Ramos', 'Julieth Urbina',
    'Luz Lozada', 'Manuela Maz', 'Mauricio Rios', 'Nazly Lugo',
    'Rafael Carmona', 'Sandra Milena Jaramillo', 'Sofia Guarin',
    'Valentina Mejía', 'Viviana Virlen'
  ];

  const paises: Pais[] = ['AR', 'BR', 'CL', 'CO', 'EC', 'PE', 'PY', 'RD', 'UY', 'US'];

  const origenes: OrigenConsulta[] = ['AMADEUS', 'SABRE', 'NO CORRESPONDE'];

  const motivosSolicitud: MotivoSolicitud[] = [
    'Cambio de Status', 'Certificado Médico', 'Cambio de Nombre', 'Facturación',
    'Opcionales – Bundles', 'Política Comercial', 'Remisiones', 'Devoluciones',
    'Pagos', 'Check-In'
  ];

  const motivosReclamo: MotivoReclamo[] = [
    'Distribución', 'Devoluciones', 'Check-In', 'Alternativas', 'BSP'
  ];

  // Motivos específicos para cuando el origen es "NO CORRESPONDE"
  const motivosNoCorresponde = ['GRUPOS', 'AGENCIAS API', 'CLIENTES SITIO WEB'];

  // Áreas específicas para escalamiento
  const areasEscalamiento: AreaEscalamiento[] = [
    'Cobros Ato', 'Sobreventa', 'Medios de pago', 'Facturación', 'Finanzas',
    'Área Comercial', 'Ventas', 'Área legal', 'Distribución'
  ];

  // Función para obtener sub motivos según el motivo seleccionado
  const getSubMotivos = () => {
    if (!motivo) return [];

    // Si el origen es "NO CORRESPONDE", los motivos no tienen sub-motivos
    if (origenConsulta === 'NO CORRESPONDE') {
      return [];
    }

    switch (motivo) {
      case 'Cambio de Status':
        return origenConsulta === 'SABRE' 
          ? [
              'OPEN - Unused', 'USED - Lifted/boarded', 'VOID - Transaction voided',
              'PRTD - Flight coupons printed', 'EXCH - Exchanged/reissued', 'RFND - Refunded',
              'CKIN - Checked in', 'CTRL - Under airport control', 'ACTL - Under airport control',
              'SUSP - Suspended by carrier', 'OK - Okay for travel', 'REAC - Reactivated',
              '**** - Unavailable for changes', 'TKT - Ticketed', 'IREG - Irregular Operations'
            ]
          : [
              'O - Open for Use', 'A - Airport Control', 'C - Checked-in', 'L - Lifted / Used',
              'F - Flown', 'R - Refunded', 'E - Exchanged / Reissued', 'V - Voided',
              'S - Suspended', 'P - Printed', 'I - Irregular / Involuntary Exchange',
              'N - No-show', 'Z - Cancelled', 'T - Ticketed'
            ];
      
      case 'Certificado Médico':
        return ['Políticas', 'Exoneración', 'Excepciones'];
      
      case 'Cambio de Nombre':
        return ['Cambio de nombre', 'Error tipográfico', 'Ley Cesión'];
      
      case 'Facturación':
        return ['Bsp Paraguay', 'Aeropuerto', 'compras post-booking'];
      
      case 'Opcionales – Bundles':
        return ['Cotización Post-booking', 'Compra Post-booking', 'Confirmación bundles', 'Familias tarifarias'];
      
      case 'Política Comercial':
        return ['Equipajes', 'Penalidades', 'ADMs', 'ACMs', 'Vuelos afectados', 'Devoluciones', 'Medios de pago', 'Emisiónes'];
      
      case 'Remisiones':
        return ['Voluntarias', 'Involuntarias', 'Excepciones - Exoneración de penalidad', 'Excepciones - Cambio sin costo'];
      
      case 'Devoluciones':
        return tipoSolicitud === 'Solicitudes' 
          ? ['Afectación', 'Excepciones Comerciales', 'ACMs', 'Tarifa reembolsable (BR G2)', 'Enfermedad', 'Defunción', 'Retracto']
          : ['Vuelo afectado', 'Estados de devolución', 'Comprobantes', 'Cobros de ATO'];
      
      case 'Pagos':
        return ['Links de pago', 'Navitaire AR', 'Monedero'];
      
      case 'Check-In':
        return tipoSolicitud === 'Solicitudes'
          ? ['Tiempos para realizar Check-in', 'Cambio de fecha de nacimiento CHD', 'Agregar infante']
          : ['Error sitio web', 'PNRS multisegmentos', 'OVBK'];
      
      case 'Distribución':
        return ['Actualización en Inventario', 'Issue Emisión', 'Políticas', 'Segmentos no Confirmados (HX, UC, NO)', 'Control Ato', 'Tiquete no sincronizado', 'Otros'];
      
      case 'Alternativas':
        return ['Afectación - Operacional', 'Afectación - Comercial', 'Sobreventa', 'Cancelación - Operacional', 'Cancelación - Comercial'];
      
      case 'BSP':
        return ['Pago Duplicado', 'Pago sin emisión de tiquete'];
      
      default:
        return [];
    }
  };

  // Resetear motivo y sub motivo cuando cambia el origen o tipo de solicitud
  useEffect(() => {
    setMotivo('');
    setSubMotivo('');
    setSubMotivoOtros('');
  }, [origenConsulta, tipoSolicitud]);

  // Función para verificar casos duplicados
  const checkForDuplicates = (pnrValue: string) => {
    if (pnrValue && pnrValue.trim() !== '') {
      const duplicates = findDuplicateCases(pnrValue);
      setDuplicateCases(duplicates);
    } else {
      setDuplicateCases([]);
    }
  };

  // Verificar duplicados cuando cambie el PNR
  useEffect(() => {
    checkForDuplicates(pnrTktLocalizador);
  }, [pnrTktLocalizador]);

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

  const handleApplyScript = (scriptContent: string) => {
    setInformacionBrindada(scriptContent);
    toast.success('Script aplicado. Revisa y ajusta según necesites.');
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
    if (!nombreAsesor || !horaIngresoCorreo || !correoElectronico || !asuntoCorreoElectronico) {
      toast.error('Por favor complete todos los campos de la Sección 1');
      return;
    }

    if (!pais || !origenConsulta) {
      toast.error('Por favor complete todos los campos de la Sección 2');
      return;
    }

    if (!pnrTktLocalizador) {
      toast.error('Por favor complete el campo PNR/TKT/Localizador');
      return;
    }

    if (!tipoSolicitud || !motivo) {
      toast.error('Por favor complete todos los campos de la Sección 4');
      return;
    }

    // El sub-motivo solo es requerido si el origen NO es "NO CORRESPONDE"
    if (origenConsulta !== 'NO CORRESPONDE' && !subMotivo) {
      toast.error('Por favor complete todos los campos de la Sección 4');
      return;
    }

    if (!solicitudCliente) {
      toast.error('Por favor describa la solicitud del cliente');
      return;
    }

    // Validar según la opción seleccionada
    if (casoOpcion === 'SI_CERRAR_CASO') {
      if (!informacionBrindada.trim()) {
        toast.error('Por favor proporciona la información brindada al cliente antes de crear y cerrar el caso');
        return;
      }
    }

    if (casoOpcion === 'NO_ESCALAR_CASO') {
      if (!escaladoA) {
        toast.error('Por favor selecciona a quién escalar el caso');
        return;
      }
      if (escaladoA === 'SUPERVISOR' && !analisisAnalista.trim()) {
        toast.error('Por favor proporciona tu análisis y motivo del escalamiento al supervisor');
        return;
      }
      if (escaladoA === 'OTRA_AREA' && !areaEscalamiento) {
        toast.error('Por favor selecciona el área a escalar');
        return;
      }
    }


    // Determinar el estado según la opción seleccionada
    let estadoInicial: any = 'nuevo';
    
    if (casoOpcion === 'SI_CERRAR_CASO') {
      estadoInicial = 'cerrado';
    } else if (casoOpcion === 'NO_ESCALAR_CASO') {
      if (escaladoA === 'SUPERVISOR') {
        estadoInicial = 'pendiente-supervisor';
      } else if (escaladoA === 'OTRA_AREA') {
        estadoInicial = 'pendiente-otra-area';
      }
    } else if (casoOpcion === 'NO_INTERACTUAR_AGENCIA') {
      estadoInicial = 'pendiente-agencia';
    }

    const newRequirement = {
      ticketNumber, // Usar el número generado
      nombreAsesor: nombreAsesor as AsesorName,
      horaIngresoCorreo,
      correoElectronico,
      asuntoCorreoElectronico,
      pais: pais as Pais,
      origenConsulta: origenConsulta as OrigenConsulta,
      esSoporteIngles: esSoporteIngles === 'Si',
      pnrTktLocalizador,
      tipoSolicitud: tipoSolicitud as TipoSolicitud,
      motivo,
      subMotivo,
      subMotivoOtros: subMotivo === 'Otros' ? subMotivoOtros : undefined,
      solicitudCliente,
      casoOpcion,
      escaladoA: casoOpcion === 'NO_ESCALAR_CASO' ? escaladoA as any : undefined,
      areaEscalamiento: escaladoA === 'OTRA_AREA' ? areaEscalamiento as AreaEscalamiento : undefined,
      analisisAnalista: escaladoA === 'SUPERVISOR' ? analisisAnalista : undefined,
      informacionBrindada,
      observaciones,
      status: estadoInicial,
      priority: 'media' as const,
      initialDate: new Date(),
      resolvedAt: casoOpcion === 'SI_CERRAR_CASO' ? new Date() : undefined,
    };

    addRequirement(newRequirement);
    
    const actionText = casoOpcion === 'SI_CERRAR_CASO' 
      ? 'creado y cerrado exitosamente' 
      : casoOpcion === 'NO_ESCALAR_CASO'
      ? 'creado y escalado exitosamente'
      : 'creado y marcado para interacción con agencia';
    
    toast.success(`Requerimiento ${actionText}`);
    navigate('/requirements');
  };

  return (
    <div className="container mx-auto py-4 space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/requirements')} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Requerimiento</h1>
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

        {/* Sección 1: Información del Asesor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Sección 1: Información del Asesor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombreAsesor">Asesor *</Label>
                <Select value={nombreAsesor} onValueChange={(value) => setNombreAsesor(value as AsesorName)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un asesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {asesores.map((asesor) => (
                      <SelectItem key={asesor} value={asesor}>
                        {asesor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaIngresoCorreo">Hora de Ingreso del Correo *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="horaIngresoCorreo"
                    type="time"
                    value={horaIngresoCorreo}
                    onChange={(e) => setHoraIngresoCorreo(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correoElectronico">Correo Electrónico *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="correoElectronico"
                    type="email"
                    value={correoElectronico}
                    onChange={(e) => setCorreoElectronico(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asuntoCorreoElectronico">Asunto del Correo Electrónico *</Label>
                <Input
                  id="asuntoCorreoElectronico"
                  value={asuntoCorreoElectronico}
                  onChange={(e) => setAsuntoCorreoElectronico(e.target.value)}
                  placeholder="Asunto del correo"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Origen de Consulta */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Sección 2: Origen de Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <Select value={pais} onValueChange={(value) => setPais(value as Pais)}>
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
                <Label htmlFor="origenConsulta">Origen *</Label>
                <Select value={origenConsulta} onValueChange={(value) => setOrigenConsulta(value as OrigenConsulta)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {origenes.map((origen) => (
                      <SelectItem key={origen} value={origen}>
                        {origen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Soporte Inglés *</Label>
                <RadioGroup value={esSoporteIngles} onValueChange={setEsSoporteIngles}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Si" id="soporte-si" />
                    <Label htmlFor="soporte-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="soporte-no" />
                    <Label htmlFor="soporte-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 3: Datos del Cliente */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Sección 3: Datos del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="pnrTktLocalizador">PNR/TKT/Localizador *</Label>
              <div className="relative">
                <Input
                  id="pnrTktLocalizador"
                  value={pnrTktLocalizador}
                  onChange={(e) => setPnrTktLocalizador(e.target.value)}
                  placeholder="ABC123 o 1234567890"
                  className={duplicateCases.length > 0 ? "border-orange-500 focus:border-orange-500" : ""}
                  required
                />
                {duplicateCases.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </div>
                )}
              </div>
              {duplicateCases.length > 0 && (
                <p className="text-sm text-orange-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Se encontraron {duplicateCases.length} caso(s) existente(s) con este PNR/TKT/Localizador
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección 4: Clasificación */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4" />
              Sección 4: Clasificación
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tipoSolicitud">Tipo de Solicitud *</Label>
                <Select value={tipoSolicitud} onValueChange={(value) => setTipoSolicitud(value as TipoSolicitud)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solicitudes">Solicitudes</SelectItem>
                    <SelectItem value="Reclamos">Reclamos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo *</Label>
                <Select value={motivo} onValueChange={setMotivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {origenConsulta === 'NO CORRESPONDE' ? (
                      motivosNoCorresponde.map((motivoOption) => (
                        <SelectItem key={motivoOption} value={motivoOption}>
                          {motivoOption}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        {tipoSolicitud === 'Solicitudes' && motivosSolicitud.map((motivoOption) => (
                          <SelectItem key={motivoOption} value={motivoOption}>
                            {motivoOption}
                          </SelectItem>
                        ))}
                        {tipoSolicitud === 'Reclamos' && motivosReclamo.map((motivoOption) => (
                          <SelectItem key={motivoOption} value={motivoOption}>
                            {motivoOption}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subMotivo">
                  Sub Motivo {origenConsulta !== 'NO CORRESPONDE' ? '*' : ''}
                </Label>
                <Select 
                  value={subMotivo} 
                  onValueChange={setSubMotivo}
                  disabled={origenConsulta === 'NO CORRESPONDE'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      origenConsulta === 'NO CORRESPONDE' 
                        ? "No aplica para este origen" 
                        : "Seleccione sub motivo"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubMotivos().map((subMotivoOption) => (
                      <SelectItem key={subMotivoOption} value={subMotivoOption}>
                        {subMotivoOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Campo libre para "Otros" */}
            {subMotivo === 'Otros' && (
              <div className="space-y-2">
                <Label htmlFor="subMotivoOtros">Especificar Sub Motivo *</Label>
                <Input
                  id="subMotivoOtros"
                  value={subMotivoOtros}
                  onChange={(e) => setSubMotivoOtros(e.target.value)}
                  placeholder="Describe el sub motivo específico"
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solicitud del Cliente */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Solicitud del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Label htmlFor="solicitudCliente">Descripción de la Solicitud *</Label>
              <Textarea
                id="solicitudCliente"
                value={solicitudCliente}
                onChange={(e) => setSolicitudCliente(e.target.value)}
                placeholder="Describe detalladamente la solicitud del cliente..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Control de Gestión de Casos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gestión del Caso</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-2">
              <Label>¿Puedes entregar la información requerida? *</Label>
              <RadioGroup value={casoOpcion} onValueChange={(value) => setCasoOpcion(value as CasoOpcion)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SI_CERRAR_CASO" id="cerrar-caso" />
                  <Label htmlFor="cerrar-caso">Sí y Cerrar Caso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NO_ESCALAR_CASO" id="escalar-caso" />
                  <Label htmlFor="escalar-caso">No y Escalar Caso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NO_INTERACTUAR_AGENCIA" id="interactuar-agencia" />
                  <Label htmlFor="interactuar-agencia">No y Interactuar con Agencia</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Opción: Escalar Caso */}
            {casoOpcion === 'NO_ESCALAR_CASO' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Escalar a: *</Label>
                  <RadioGroup value={escaladoA} onValueChange={setEscaladoA}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SUPERVISOR" id="escalado-supervisor" />
                      <Label htmlFor="escalado-supervisor">Supervisor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="OTRA_AREA" id="escalado-area" />
                      <Label htmlFor="escalado-area">Otra Área</Label>
                    </div>
                  </RadioGroup>
                </div>

                {escaladoA === 'SUPERVISOR' && (
                  <div className="space-y-2">
                    <Label htmlFor="analisisAnalista">Análisis y Motivo del Escalamiento *</Label>
                    <Textarea
                      id="analisisAnalista"
                      value={analisisAnalista}
                      onChange={(e) => setAnalisisAnalista(e.target.value)}
                      placeholder="Proporciona un análisis detallado del caso y el motivo por el cual necesitas escalarlo al supervisor..."
                      rows={4}
                      required
                    />
                  </div>
                )}

                {escaladoA === 'OTRA_AREA' && (
                  <div className="space-y-2">
                    <Label htmlFor="areaEscalamiento">Seleccione el Área *</Label>
                    <Select value={areaEscalamiento} onValueChange={(value) => setAreaEscalamiento(value as AreaEscalamiento)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areasEscalamiento.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

          </CardContent>
        </Card>

        {/* Información Brindada - Solo para casos que se van a cerrar */}
        {casoOpcion === 'SI_CERRAR_CASO' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Información Brindada</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {availableScripts.length > 0 && (
                <ScriptSelector
                  scripts={availableScripts}
                  onApplyScript={handleApplyScript}
                />
              )}
              
              <div className="space-y-2">
                <Label htmlFor="informacionBrindada">Información Brindada al Cliente *</Label>
                <Textarea
                  id="informacionBrindada"
                  value={informacionBrindada}
                  onChange={(e) => setInformacionBrindada(e.target.value)}
                  placeholder="Describe la información que se le brindó al cliente..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => navigate('/requirements')}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" className="gap-2">
            {casoOpcion === 'SI_CERRAR_CASO' ? (
              <>
                ✅ Crear y Cerrar Caso
              </>
            ) : (
              <>
                📝 Crear Requerimiento
              </>
            )}
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
