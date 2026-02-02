export type RequirementStatus = 
  | 'nuevo' 
  | 'en-proceso' 
  | 'pendiente-informacion' 
  | 'pendiente-supervisor' 
  | 'respuesta-supervisor'
  | 'pendiente-otra-area' 
  | 'respuesta-otra-area'
  | 'pendiente-agencia'
  | 'respuesta-agencia'
  | 'resuelto' 
  | 'cerrado';
export type RequirementPriority = 'baja' | 'media' | 'alta' | 'critica';

// Nombre del Asesor (13 asesores)
export type AsesorName = 
  | 'Jenny Andrea Taborda'
  | 'Jhoan Restrepo'
  | 'José Ramos'
  | 'Julieth Urbina'
  | 'Luz Lozada'
  | 'Manuela Maz'
  | 'Mauricio Rios'
  | 'Nazly Lugo'
  | 'Rafael Carmona'
  | 'Sandra Milena Jaramillo'
  | 'Sofia Guarin'
  | 'Valentina Mejía'
  | 'Viviana Virlen';

// Países
export type Pais = 
  | 'AR' | 'BR' | 'CL' | 'CO' | 'EC' | 'PE' | 'PY' | 'RD' | 'UY' | 'US';

// Origen Consulta
export type OrigenConsulta = 'AMADEUS' | 'SABRE' | 'NO CORRESPONDE';

// Tipo de Solicitud (Nueva estructura)
export type TipoSolicitud = 'Solicitudes' | 'Reclamos';

// Motivos para Solicitudes
export type MotivoSolicitud = 
  | 'Cambio de Status'
  | 'Certificado Médico'
  | 'Cambio de Nombre'
  | 'Facturación'
  | 'Opcionales – Bundles'
  | 'Política Comercial'
  | 'Remisiones'
  | 'Devoluciones'
  | 'Pagos'
  | 'Check-In';

// Motivos para Reclamos
export type MotivoReclamo = 
  | 'Distribución'
  | 'Devoluciones'
  | 'Check-In'
  | 'Alternativas'
  | 'BSP';

// Sub Motivos para Cambio de Status (SABRE)
export type SubMotivoCambioStatusSabre = 
  | 'OPEN - Unused'
  | 'USED - Lifted/boarded'
  | 'VOID - Transaction voided'
  | 'PRTD - Flight coupons printed'
  | 'EXCH - Exchanged/reissued'
  | 'RFND - Refunded'
  | 'CKIN - Checked in'
  | 'CTRL - Under airport control'
  | 'ACTL - Under airport control'
  | 'SUSP - Suspended by carrier'
  | 'OK - Okay for travel'
  | 'REAC - Reactivated'
  | '**** - Unavailable for changes'
  | 'TKT - Ticketed'
  | 'IREG - Irregular Operations';

// Sub Motivos para Cambio de Status (AMADEUS)
export type SubMotivoCambioStatusAmadeus = 
  | 'O - Open for Use'
  | 'A - Airport Control'
  | 'C - Checked-in'
  | 'L - Lifted / Used'
  | 'F - Flown'
  | 'R - Refunded'
  | 'E - Exchanged / Reissued'
  | 'V - Voided'
  | 'S - Suspended'
  | 'P - Printed'
  | 'I - Irregular / Involuntary Exchange'
  | 'N - No-show'
  | 'Z - Cancelled'
  | 'T - Ticketed';

// Sub Motivos para Certificado Médico
export type SubMotivoCertificadoMedico = 
  | 'Políticas'
  | 'Exoneración'
  | 'Excepciones';

// Sub Motivos para Cambio de Nombre
export type SubMotivoCambioNombre = 
  | 'Cambio de nombre'
  | 'Error tipográfico'
  | 'Ley Cesión';

// Sub Motivos para Facturación
export type SubMotivoFacturacion = 
  | 'Bsp Paraguay'
  | 'Aeropuerto'
  | 'compras post-booking';

// Sub Motivos para Opcionales – Bundles
export type SubMotivoOpcionalesBundles = 
  | 'Cotización Post-booking'
  | 'Compra Post-booking'
  | 'Confirmación bundles'
  | 'Familias tarifarias';

// Sub Motivos para Política Comercial
export type SubMotivoPoliticaComercial = 
  | 'Equipajes'
  | 'Penalidades'
  | 'ADMs'
  | 'ACMs'
  | 'Vuelos afectados'
  | 'Devoluciones'
  | 'Medios de pago'
  | 'Emisiónes';

// Sub Motivos para Remisiones
export type SubMotivoRemisiones = 
  | 'Voluntarias'
  | 'Involuntarias'
  | 'Excepciones - Exoneración de penalidad'
  | 'Excepciones - Cambio sin costo';

// Sub Motivos para Devoluciones (Solicitudes)
export type SubMotivoDevolucionesSolicitud = 
  | 'Afectación'
  | 'Excepciones Comerciales'
  | 'ACMs'
  | 'Tarifa reembolsable (BR G2)'
  | 'Enfermedad'
  | 'Defunción'
  | 'Retracto';

// Sub Motivos para Pagos
export type SubMotivoPagos = 
  | 'Links de pago'
  | 'Navitaire AR'
  | 'Monedero';

// Sub Motivos para Check-In (Solicitudes)
export type SubMotivoCheckInSolicitud = 
  | 'Tiempos para realizar Check-in'
  | 'Cambio de fecha de nacimiento CHD'
  | 'Agregar infante';

// Sub Motivos para Distribución
export type SubMotivoDistribucion = 
  | 'Actualización en Inventario'
  | 'Issue Emisión'
  | 'Políticas'
  | 'Segmentos no Confirmados (HX, UC, NO)'
  | 'Control Ato'
  | 'Tiquete no sincronizado'
  | 'Otros';

// Sub Motivos para Devoluciones (Reclamos)
export type SubMotivoDevolucionesReclamo = 
  | 'Vuelo afectado'
  | 'Estados de devolución'
  | 'Comprobantes'
  | 'Cobros de ATO';

// Sub Motivos para Check-In (Reclamos)
export type SubMotivoCheckInReclamo = 
  | 'Error sitio web'
  | 'PNRS multisegmentos'
  | 'OVBK';

// Sub Motivos para Alternativas
export type SubMotivoAlternativas = 
  | 'Afectación - Operacional'
  | 'Afectación - Comercial'
  | 'Sobreventa'
  | 'Cancelación - Operacional'
  | 'Cancelación - Comercial';

// Sub Motivos para BSP
export type SubMotivoBSP = 
  | 'Pago Duplicado'
  | 'Pago sin emisión de tiquete';

export interface RequirementHistory {
  id: string;
  date: Date;
  action: string;
  user: string;
  comment?: string;
}

// Tipos de Usuario del Sistema
export type UserRole = 'ANALISTA' | 'SUPERVISOR' | 'ADMINISTRADOR';

// Opciones de Escalamiento
export type EscalationOption = 'SUPERVISOR' | 'OTRA_AREA';

// Nuevas opciones de gestión de casos
export type CasoOpcion = 'SI_CERRAR_CASO' | 'NO_ESCALAR_CASO' | 'NO_INTERACTUAR_AGENCIA';

// Áreas específicas para escalamiento
export type AreaEscalamiento = 
  | 'Cobros Ato'
  | 'Sobreventa'
  | 'Medios de pago'
  | 'Facturación'
  | 'Finanzas'
  | 'Área Comercial'
  | 'Ventas'
  | 'Área legal'
  | 'Distribución';

// Estados adicionales para interacción con agencia
export type RequirementStatus = 
  | 'nuevo' 
  | 'en-proceso' 
  | 'pendiente-informacion' 
  | 'pendiente-supervisor' 
  | 'respuesta-supervisor'
  | 'pendiente-otra-area' 
  | 'pendiente-agencia'
  | 'respuesta-agencia'
  | 'resuelto' 
  | 'cerrado';

// Acciones del Supervisor
export type SupervisorAction = 'autorizar_analista' | 'resolver_directo' | null;

export interface Requirement {
  id: string;
  ticketNumber: string; // Número de ticket/caso autogenerado
  
  // Sección 1: Información Personal de Aeropuerto
  nombreAsesor: string; // Nombre y Apellido del Solicitante (texto libre)
  horaIngresoCorreo: string; // HH:MM (autogenerado al crear el requerimiento)
  correoElectronico: string;
  
  // Sección 2: Origen de Consulta
  pais: Pais;
  origenConsulta: OrigenConsulta;
  esSoporteIngles: boolean; // Si/No
  
  // Sección 3: Datos del Cliente
  pnrTktLocalizador: string; // PNR - TKT - Localizador AMADEUS-SABRE
  
  // Sección 4: Clasificación
  tipoSolicitud: TipoSolicitud | '';
  motivo: string; // Motivo seleccionado
  subMotivo: string; // Sub motivo seleccionado
  subMotivoOtros?: string; // Campo libre para "Otros"
  
  solicitudCliente: string; // Texto largo
  
  // Control de gestión de casos (Nueva estructura)
  casoOpcion: CasoOpcion; // Nueva opción principal
  escaladoA?: EscalationOption; // SUPERVISOR | OTRA_AREA
  areaEscalamiento?: AreaEscalamiento; // Área específica si es OTRA_AREA
  
  // Análisis del Analista (obligatorio cuando escala a supervisor)
  analisisAnalista?: string; // Resumen y motivo del escalamiento al supervisor
  
  // Gestión del Supervisor (para casos escalados)
  respuestaSupervisor?: string; // Respuesta/instrucciones del supervisor al analista
  accionSupervisor?: SupervisorAction; // Qué decidió hacer el supervisor
  supervisorResolvio?: boolean; // Si el supervisor resolvió directamente el caso
  
  // Interacción con Agencia
  consultaAgencia?: string; // Consulta realizada a la agencia
  respuestaAgencia?: string; // Respuesta recibida de la agencia
  historialInteraccionAgencia?: Array<{
    id: string;
    fecha: Date;
    consulta: string;
    respuesta: string;
    usuario: string;
  }>;

  // Interacción con Otra Área
  consultaOtraArea?: string; // Consulta realizada a la otra área
  respuestaOtraArea?: string; // Respuesta recibida de la otra área
  historialInteraccionOtraArea?: Array<{
    id: string;
    fecha: Date;
    consulta: string;
    respuesta: string;
    usuario: string;
    area: string; // Área específica
  }>;
  
  informacionBrindada: string; // Texto largo
  observaciones: string; // Texto largo
  
  // Campos de gestión interna
  status: RequirementStatus;
  priority: RequirementPriority;
  assignedTo?: string;
  assignedTeam?: string;
  slaDeadline?: Date;
  
  // Timestamps
  initialDate: Date;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  statusChangedAt?: Date; // Fecha del último cambio de estado
  
  // Historial y extras
  history: RequirementHistory[];
  attachments?: string[];
  tags?: string[];
}
