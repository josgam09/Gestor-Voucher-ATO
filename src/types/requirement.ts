import type { UserRole } from '@/types/user';

export type RequirementStatus = 
  | 'ingresado'
  | 'en-gestion'
  | 'enviado';
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
  | 'AR' | 'BR' | 'CL' | 'CO' | 'DO' | 'EC' | 'PE' | 'PY' | 'UY';

// Base Origen (código IATA de base/aeropuerto)
export type BaseOrigen = string;

// Vuelo operado por
export type VueloOperadoPor = 'JA' | 'WJ' | 'JZ' | 'J6';

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

export type RequirementInteractionType =
  | 'SOLICITUD_INFO';

export type RequirementInteractionPriority =
  | 'URGENTE'
  | 'NORMAL';

export type RequirementInteractionStatus =
  | 'PENDIENTE'
  | 'RESPONDIDA'
  | 'CERRADA';

export interface RequirementInteraction {
  id: string;
  type: RequirementInteractionType;
  priority: RequirementInteractionPriority;
  status: RequirementInteractionStatus;

  createdAt: Date;
  createdByRole: UserRole;
  createdByName: string;

  toRole: UserRole;
  title?: string;
  message: string;

  respondedAt?: Date;
  respondedByRole?: UserRole;
  respondedByName?: string;
  responseMessage?: string;

  closedAt?: Date;
  closedByRole?: UserRole;
  closedByName?: string;
}

// (nota) Roles del sistema se definen en `src/types/user.ts`.

export interface Requirement {
  id: string;
  ticketNumber: string; // Número de ticket/caso autogenerado
  
  // Sección 1: Información Personal de Aeropuerto
  nombreAsesor: string; // Nombre y Apellido del Solicitante (texto libre)
  horaIngresoCorreo: string; // HH:MM (autogenerado al crear el requerimiento)
  correoElectronico: string;
  
  // Sección 2: Origen de la Solicitud
  pais: Pais;
  baseOrigen: BaseOrigen;
  
  // Sección 3: Datos del Pasajero y Vuelo
  pnrTktLocalizador: string; // PNR - TKT - Localizador AMADEUS-SABRE

  // Datos del Pasajero y Vuelo
  pasajeroNombreApellido?: string;
  pasajeroDocumento?: string; // RUT / DNI / PASAPORTE
  pasajeroCorreo?: string;
  fechaVuelo?: Date;
  numeroVuelo?: string;
  tramoVuelo?: string;
  vueloOperadoPor?: VueloOperadoPor;
  
  // Sección 4: Motivo y Sub Motivo de la Solicitud de Voucher
  motivo: string; // Motivo seleccionado
  subMotivo: string; // Sub motivo seleccionado
  subMotivoOtros?: string; // Campo libre para "Otros"

  comentariosAdicionales?: string; // Campo libre adicional

  // Sección 5: Información del Voucher
  montoVoucherUsd: number; // Monto del Voucher (USD)
  fechaEnvioVoucher?: Date; // Fecha en que se envió el voucher (cuando status = "enviado")
  observaciones?: string; // Notas internas (opcional)
  
  // Campos de gestión interna
  status: RequirementStatus;
  priority: RequirementPriority;
  assignedTo?: string;
  assignedTeam?: string;
  
  // Timestamps
  initialDate: Date;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  statusChangedAt?: Date; // Fecha del último cambio de estado
  
  // Historial y extras
  history: RequirementHistory[];
  interactions: RequirementInteraction[];
  attachments?: string[];
  tags?: string[];
}
