// Scripts de respuesta para Información Brindada
// Sistema de Distribución AMADEUS y SABRE
// Actualizado con mejores prácticas y múltiples opciones por categoría

export interface ResponseScript {
  id: string;
  title: string;
  content: string;
  category: 'tipoSolicitud' | 'reclamoIncidente';
  applicableFor: string[]; // IDs de tipos o reclamos aplicables
  gdsSystem?: 'AMADEUS' | 'SABRE' | 'AMBOS'; // Sistema GDS específico
  tags?: string[];
}

// ========================================
// SCRIPTS POR TIPO DE SOLICITUD
// ========================================

export const tipoSolicitudScripts: ResponseScript[] = [
  // ===== WAIVER GDS - SABRE =====
  {
    id: 'waiver-sabre-aprobado-1',
    title: 'Waiver SABRE Aprobado - Cambio de Fecha',
    content: `Estimado/a [NOMBRE CLIENTE],

Le informamos que su solicitud de waiver ha sido APROBADA exitosamente en el sistema SABRE.

📋 DETALLES DEL CAMBIO:
• Vuelo original: [VUELO ORIGINAL] - [FECHA ORIGINAL]
• Nuevo vuelo: [NUEVO VUELO] - [NUEVA FECHA]
• PNR: [PNR]
• Waiver Code: [CÓDIGO WAIVER]

💰 CARGOS:
• Penalidad por cambio: $0 (Waiver aplicado)
• Diferencia tarifaria: [MONTO O "No aplica"]

✅ ACCIONES COMPLETADAS:
• Waiver ingresado en SABRE
• Nuevo segmento confirmado
• Ticket reemitido: [NÚMERO TICKET]
• EMD emitido (si aplica): [EMD]

El nuevo ticket ha sido enviado a su correo electrónico.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Waiver GDS - Sabre'],
    gdsSystem: 'SABRE',
    tags: ['waiver', 'sabre', 'aprobado', 'cambio-fecha']
  },
  {
    id: 'waiver-sabre-escalado-1',
    title: 'Waiver SABRE - Escalado a GDS',
    content: `Estimado/a [NOMBRE CLIENTE],

Su solicitud de waiver ha sido escalada al equipo GDS SABRE para aprobación.

📝 INFORMACIÓN DEL ESCALAMIENTO:
• Ticket de escalamiento: VO_ATO-[NÚMERO]
• Motivo del waiver: [MOTIVO]
• PNR: [PNR]
• Vuelo: [VUELO]

⏱️ TIEMPO ESTIMADO:
• Respuesta del GDS: 24-48 horas hábiles
• Se le notificará vía email al obtener respuesta

📧 Recibirá actualización en: [EMAIL]

Agradecemos su paciencia.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Waiver GDS - Sabre'],
    gdsSystem: 'SABRE',
    tags: ['waiver', 'sabre', 'escalado', 'pendiente']
  },
  {
    id: 'waiver-sabre-rechazado-1',
    title: 'Waiver SABRE - No Aprobado',
    content: `Estimado/a [NOMBRE CLIENTE],

Lamentamos informarle que su solicitud de waiver no ha sido aprobada por el sistema SABRE.

❌ MOTIVO DE RECHAZO:
[MOTIVO ESPECÍFICO DEL GDS]

💡 ALTERNATIVAS DISPONIBLES:
1. Proceder con el cambio aplicando las penalidades correspondientes
   • Penalidad: [MONTO]
   • Diferencia tarifaria: [MONTO]
   • Total a pagar: [MONTO TOTAL]

2. Mantener la reserva original sin cambios

3. Cancelar y solicitar devolución según política tarifaria

Por favor indíquenos cómo desea proceder.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Waiver GDS - Sabre'],
    gdsSystem: 'SABRE',
    tags: ['waiver', 'sabre', 'rechazado', 'alternativas']
  },

  // ===== WAIVER COMERCIAL =====
  {
    id: 'waiver-comercial-aprobado-1',
    title: 'Waiver Comercial Aprobado',
    content: `Estimado/a [NOMBRE CLIENTE],

Su solicitud de waiver comercial ha sido APROBADA por nuestro departamento comercial.

✅ AUTORIZACIÓN COMERCIAL:
• Aprobado por: [NOMBRE SUPERVISOR]
• Código de autorización: [CÓDIGO]
• Válido hasta: [FECHA]

💰 CONDICIONES:
• Penalidad waiver: EXONERADA
• Diferencia tarifaria: [MONTO O "Exonerada"]
• Cambios permitidos: [NÚMERO] cambio(s)

📋 NUEVO ITINERARIO:
• [DETALLES DEL NUEVO VUELO]

Puede proceder con la modificación solicitada.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Waiver Comercial'],
    gdsSystem: 'AMBOS',
    tags: ['waiver', 'comercial', 'aprobado']
  },

  // ===== REMISIÓN VOLUNTARIA - INVOLUNTARIA =====
  {
    id: 'remision-voluntaria-1',
    title: 'Remisión Voluntaria Procesada',
    content: `Estimado/a [NOMBRE CLIENTE],

Su solicitud de remisión voluntaria ha sido procesada exitosamente.

✈️ VUELO ORIGINAL REMITIDO:
• Vuelo: [VUELO ORIGINAL]
• Fecha: [FECHA ORIGINAL]
• Status: REMITIDO

✅ NUEVO ITINERARIO CONFIRMADO:
• Vuelo: [NUEVO VUELO]
• Fecha: [NUEVA FECHA]
• Horario: [HORARIO]
• Clase: [CLASE]

📄 DOCUMENTACIÓN:
• Nuevo ticket emitido: [NÚMERO TICKET]
• PNR actualizado: [PNR]
• Diferencia tarifaria: [MONTO O "No aplica"]

El nuevo ticket y comprobante de remisión han sido enviados a su correo.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Remisión Voluntaria - Involuntaria'],
    gdsSystem: 'AMBOS',
    tags: ['remision', 'voluntaria', 'procesada']
  },
  {
    id: 'remision-involuntaria-1',
    title: 'Remisión Involuntaria - Cancelación de Vuelo',
    content: `Estimado/a [NOMBRE CLIENTE],

Debido a la cancelación del vuelo por parte de la aerolínea, procedemos con remisión INVOLUNTARIA.

❌ VUELO CANCELADO:
• Vuelo: [VUELO]
• Fecha: [FECHA]
• Motivo: [MOTIVO CANCELACIÓN]

✅ REUBICACIÓN AUTOMÁTICA:
• Nuevo vuelo: [NUEVO VUELO]
• Fecha: [NUEVA FECHA]
• Horario: [HORARIO]
• SIN COSTO ADICIONAL

🎁 COMPENSACIÓN (si aplica):
• [DETALLAR COMPENSACIÓN SEGÚN NORMATIVA]

Le hemos enviado el nuevo ticket a su correo electrónico.

Lamentamos los inconvenientes causados.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Remisión Voluntaria - Involuntaria'],
    gdsSystem: 'AMBOS',
    tags: ['remision', 'involuntaria', 'cancelacion']
  },

  // ===== CESIÓN - CAMBIO DE NOMBRE =====
  {
    id: 'cambio-nombre-1',
    title: 'Corrección de Nombre - Typo Menor',
    content: `Estimado/a [NOMBRE CLIENTE],

Se ha realizado la corrección de nombre en su reserva.

📝 CORRECCIÓN REALIZADA:
• Nombre en ticket: [NOMBRE INCORRECTO]
• Nombre correcto: [NOMBRE CORRECTO]
• Tipo de corrección: Typo menor (hasta 3 caracteres)

✅ SISTEMA ACTUALIZADO:
• PNR actualizado en [AMADEUS/SABRE]
• Nuevo ticket emitido: [NÚMERO TICKET]
• Sin cargo por corrección (typo menor)

Por favor verifique que todos los datos sean correctos antes del vuelo.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Cesión - Cambio de Nombre Vol - Corrección'],
    gdsSystem: 'AMBOS',
    tags: ['nombre', 'correccion', 'typo']
  },
  {
    id: 'cambio-nombre-2',
    title: 'Cambio de Nombre Completo - Cesión',
    content: `Estimado/a [NOMBRE CLIENTE],

Su solicitud de cambio de nombre/cesión ha sido procesada.

📋 INFORMACIÓN DEL CAMBIO:
• Pasajero original: [NOMBRE ORIGINAL]
• Nuevo pasajero: [NOMBRE NUEVO]
• Tipo: Cesión completa

💰 CARGOS APLICADOS:
• Tarifa de cambio de nombre: [MONTO]
• Diferencia tarifaria: [MONTO]
• Total cobrado: [TOTAL]

✅ NUEVO TICKET EMITIDO:
• Ticket #: [NÚMERO]
• A nombre de: [NOMBRE COMPLETO NUEVO PASAJERO]
• PNR: [PNR]

El ticket original ha sido anulado y el nuevo enviado al correo electrónico proporcionado.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Cesión - Cambio de Nombre Vol - Corrección'],
    gdsSystem: 'AMBOS',
    tags: ['nombre', 'cesion', 'completo']
  },

  // ===== CERTIFICADO MÉDICO =====
  {
    id: 'certificado-medico-1',
    title: 'Certificado Médico Aprobado - Devolución',
    content: `Estimado/a [NOMBRE CLIENTE],

Su certificado médico ha sido aprobado y se procederá con la devolución correspondiente.

✅ CERTIFICADO APROBADO:
• Documento recibido: [TIPO DE CERTIFICADO]
• Validado por: Departamento médico
• Fecha de aprobación: [FECHA]

💰 PROCESO DE DEVOLUCIÓN:
• Tipo: Devolución por causa médica
• Monto: [MONTO TOTAL O PARCIAL]
• Método: [FORMA DE PAGO ORIGINAL]
• Tiempo estimado: 30-45 días hábiles

📄 DOCUMENTACIÓN:
• Ticket anulado: [NÚMERO TICKET]
• Código de devolución: [CÓDIGO]
• PNR cancelado: [PNR]

Recibirá confirmación vía email una vez acreditada la devolución.

Deseándole pronta recuperación.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Certificado Médico'],
    gdsSystem: 'AMBOS',
    tags: ['medico', 'certificado', 'devolucion']
  },

  // ===== CAMBIO DE STATUS =====
  {
    id: 'cambio-status-1',
    title: 'Cambio de Status de Ticket Confirmado',
    content: `Estimado/a [NOMBRE CLIENTE],

Se ha procesado el cambio de status en su ticket.

🔄 CAMBIO REALIZADO:
• Status anterior: [STATUS ANTERIOR]
• Nuevo status: [NUEVO STATUS]
• Ticket #: [NÚMERO TICKET]
• PNR: [PNR]

✅ SISTEMA ACTUALIZADO EN:
• [AMADEUS/SABRE]: Actualizado
• BSP/ARC: Actualizado
• Estado en aerolínea: Confirmado

📋 PRÓXIMOS PASOS:
[INDICAR PASOS SIGUIENTES SEGÚN EL CASO]

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Cambio de Status (Ticket)'],
    gdsSystem: 'AMBOS',
    tags: ['status', 'ticket', 'cambio']
  },

  // ===== OPCIONALES - BUNDLES =====
  {
    id: 'bundles-1',
    title: 'Bundle Agregado Exitosamente',
    content: `Estimado/a [NOMBRE CLIENTE],

Su solicitud de servicios adicionales ha sido procesada.

🎒 BUNDLE/OPCIONALES AGREGADOS:
• Bundle seleccionado: [NOMBRE BUNDLE]
• Servicios incluidos:
  - [SERVICIO 1]
  - [SERVICIO 2]
  - [SERVICIO 3]

💰 COSTO ADICIONAL:
• Precio bundle: [MONTO]
• Forma de pago: [MÉTODO]
• Factura/Recibo: [NÚMERO]

✅ CONFIRMACIÓN:
• Reflejado en PNR: [PNR]
• SSR agregados en sistema
• Confirmado con aerolínea

Los servicios estarán disponibles para su vuelo.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Opcionales - BUNDLES'],
    gdsSystem: 'AMBOS',
    tags: ['bundle', 'opcionales', 'servicios']
  },

  // ===== RETRACTO =====
  {
    id: 'retracto-1',
    title: 'Retracto Procesado (CL/BR/CO)',
    content: `Estimado/a [NOMBRE CLIENTE],

Su solicitud de retracto ha sido procesada conforme a la normativa de [PAÍS: CL/BR/CO].

✅ RETRACTO APROBADO:
• Normativa aplicable: Ley de Protección al Consumidor [PAÍS]
• Solicitud recibida dentro del plazo legal
• Fecha de compra: [FECHA COMPRA]
• Fecha de solicitud: [FECHA SOLICITUD]

💰 DEVOLUCIÓN:
• Monto total: [MONTO] (100% del valor pagado)
• Forma de pago original: [MÉTODO]
• Tiempo estimado: 10 días hábiles

📄 TICKET ANULADO:
• Ticket #: [NÚMERO]
• PNR cancelado: [PNR]
• Código de anulación: [CÓDIGO]

La devolución será procesada automáticamente.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Retracto (CL/BR/CO)'],
    gdsSystem: 'AMBOS',
    tags: ['retracto', 'devolucion', 'normativa']
  },

  // ===== POLÍTICA COMERCIAL =====
  {
    id: 'politica-comercial-1',
    title: 'Consulta Política Comercial - Respuesta',
    content: `Estimado/a [NOMBRE CLIENTE],

En respuesta a su consulta sobre política comercial:

📋 POLÍTICA APLICABLE:
• Tipo de tarifa: [TIPO TARIFA]
• Regla tarifaria: [NÚMERO REGLA]
• Clase de reserva: [CLASE]

✅ CONDICIONES:
• Cambios permitidos: [SÍ/NO]
  - Cargo por cambio: [MONTO]
  - Antes de la salida: [CONDICIÓN]

• Devolución permitida: [SÍ/NO]
  - Cargo por devolución: [MONTO]
  - Reembolsable: [PORCENTAJE]

• Restricciones:
  - [RESTRICCIÓN 1]
  - [RESTRICCIÓN 2]

📞 Para proceder con [ACCIÓN SOLICITADA], puede contactarnos directamente.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Política Comercial - Regulación de Emisión'],
    gdsSystem: 'AMBOS',
    tags: ['politica', 'comercial', 'consulta']
  },

  // ===== FACTURACIÓN =====
  {
    id: 'facturacion-emitida-1',
    title: 'Factura Emitida Correctamente',
    content: `Estimado/a [NOMBRE CLIENTE],

Su factura ha sido emitida exitosamente.

📄 DETALLES DE FACTURACIÓN:
• Número de factura: [NÚMERO FACTURA]
• Fecha de emisión: [FECHA]
• RUT/NIT/CUIT: [IDENTIFICACIÓN FISCAL]
• Razón social: [RAZÓN SOCIAL]

💰 DETALLE DE COBROS:
• Tarifa base: [MONTO]
• Taxes: [MONTO]
• Servicios adicionales: [MONTO]
• Total facturado: [MONTO TOTAL]

📎 La factura en formato PDF ha sido enviada a: [EMAIL]

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Facturación'],
    gdsSystem: 'AMBOS',
    tags: ['factura', 'emitida']
  },
  {
    id: 'facturacion-correccion-1',
    title: 'Corrección de Factura Procesada',
    content: `Estimado/a [NOMBRE CLIENTE],

La corrección de su factura ha sido procesada.

🔄 CORRECCIÓN REALIZADA:
• Factura original (ANULADA): [NÚMERO ORIGINAL]
• Motivo de corrección: [MOTIVO]

✅ NUEVA FACTURA EMITIDA:
• Número: [NUEVO NÚMERO]
• Fecha emisión: [FECHA]
• Datos corregidos: [DETALLAR CORRECCIÓN]

💰 MONTOS:
• Factura original: [MONTO]
• Factura corregida: [MONTO]
• Diferencia: [DIFERENCIA]

📎 Adjunto encontrará:
• Nueva factura en PDF
• Nota de crédito (si aplica)

Lamentamos los inconvenientes.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Facturación'],
    gdsSystem: 'AMBOS',
    tags: ['factura', 'correccion', 'nota-credito']
  },

  // ===== TOMA DE PAGOS =====
  {
    id: 'toma-pagos-1',
    title: 'Pago Recibido y Procesado',
    content: `Estimado/a [NOMBRE CLIENTE],

Confirmamos la recepción y procesamiento de su pago.

💳 INFORMACIÓN DEL PAGO:
• Método de pago: [WEBPAY/PORTAL AG/OTRO]
• Monto pagado: [MONTO]
• Fecha de transacción: [FECHA]
• Código de autorización: [CÓDIGO]
• Número de operación: [NÚMERO]

✅ TICKET EMITIDO:
• Ticket #: [NÚMERO TICKET]
• PNR: [PNR]
• Pasajero: [NOMBRE PASAJERO]

📧 El ticket y comprobante de pago han sido enviados a: [EMAIL]

Gracias por su preferencia.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'tipoSolicitud',
    applicableFor: ['Toma de Pagos (WebPay/Portal AG/Otro)'],
    gdsSystem: 'AMBOS',
    tags: ['pago', 'webpay', 'confirmado']
  },
];

// ========================================
// SCRIPTS POR RECLAMOS / INCIDENTES
// ========================================

export const reclamoIncidenteScripts: ResponseScript[] = [
  // ===== ERROR EN EMISIÓN =====
  {
    id: 'error-emision-amadeus-1',
    title: 'Error Emisión AMADEUS - Corregido',
    content: `Estimado/a [NOMBRE CLIENTE],

Hemos identificado y corregido el error en la emisión de su ticket en sistema AMADEUS.

🔍 ERROR IDENTIFICADO:
• Tipo de error: [DESCRIPCIÓN ERROR]
• Código de error AMADEUS: [CÓDIGO]
• Causa: [CAUSA DEL ERROR]

✅ CORRECCIÓN APLICADA:
• Ticket original VOID: [NÚMERO ORIGINAL]
• Nuevo ticket emitido: [NÚMERO NUEVO]
• PNR actualizado: [PNR]
• Validado en sistema AMADEUS

📋 VERIFICACIÓN:
• Tarifa correcta aplicada: ✓
• Segmentos confirmados: ✓
• Datos de pasajero correctos: ✓
• TST generado correctamente: ✓

El nuevo ticket ha sido enviado a su correo electrónico.

Lamentamos los inconvenientes.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Error en Emisión (Amadeus - Navitaire -Sabre)'],
    gdsSystem: 'AMADEUS',
    tags: ['error', 'emision', 'amadeus', 'corregido']
  },
  {
    id: 'error-emision-sabre-1',
    title: 'Error Emisión SABRE - Corregido',
    content: `Estimado/a [NOMBRE CLIENTE],

Hemos resuelto el error en la emisión de su ticket en sistema SABRE.

🔍 ERROR IDENTIFICADO:
• Tipo de error: [DESCRIPCIÓN ERROR]
• Mensaje SABRE: [MENSAJE ERROR]
• Causa raíz: [CAUSA]

✅ SOLUCIÓN APLICADA:
• Ticket original anulado (VOID): [NÚMERO]
• Nuevo ticket emitido: [NÚMERO NUEVO]
• PNR reconstruido: [PNR]
• Validación SABRE: OK

🔐 VERIFICACIONES COMPLETADAS:
• Fare calculation correcta: ✓
• Endorsement correcto: ✓
• Form of payment válida: ✓
• Todos los segments OK: ✓

Su nuevo ticket ha sido enviado por correo electrónico.

Lamentamos los inconvenientes causados.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Error en Emisión (Amadeus - Navitaire -Sabre)'],
    gdsSystem: 'SABRE',
    tags: ['error', 'emision', 'sabre', 'corregido']
  },
  {
    id: 'error-emision-en-proceso-1',
    title: 'Error Emisión - En Revisión Técnica',
    content: `Estimado/a [NOMBRE CLIENTE],

Estamos trabajando en la corrección del error de emisión reportado.

🔧 ESTADO ACTUAL:
• Error detectado en: [AMADEUS/SABRE]
• Tipo de error: [TIPO]
• Ticket afectado: [NÚMERO]
• PNR: [PNR]

👨‍💻 ACCIONES EN CURSO:
• Caso escalado a equipo técnico GDS
• En revisión por especialistas
• Análisis de causa raíz en proceso

⏱️ TIEMPO ESTIMADO:
• Resolución: 2-4 horas
• Se le notificará inmediatamente al resolver

Agradecemos su comprensión.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Error en Emisión (Amadeus - Navitaire -Sabre)'],
    gdsSystem: 'AMBOS',
    tags: ['error', 'emision', 'proceso', 'revision']
  },

  // ===== ALTERNATIVA POR CANCELACIÓN =====
  {
    id: 'cancelacion-alternativa-1',
    title: 'Vuelo Cancelado - Alternativas Ofrecidas',
    content: `Estimado/a [NOMBRE CLIENTE],

Lamentamos informarle que su vuelo ha sido cancelado por la aerolínea.

❌ VUELO CANCELADO:
• Vuelo: [NÚMERO VUELO]
• Ruta: [ORIGEN-DESTINO]
• Fecha original: [FECHA]
• Motivo: [MOTIVO CANCELACIÓN]

✈️ ALTERNATIVAS DISPONIBLES:

OPCIÓN 1: Reubicación en próximo vuelo
• Vuelo: [VUELO ALTERNATIVO]
• Fecha: [FECHA]
• Horario: [HORARIO]
• Sin costo adicional

OPCIÓN 2: Devolución completa
• Monto: [MONTO] (100% del valor pagado)
• Tiempo: 30-45 días hábiles

OPCIÓN 3: Crédito para uso futuro
• Valor: [MONTO]
• Validez: [TIEMPO]
• Uso: Cualquier ruta y fecha

Por favor indíquenos su preferencia para proceder de inmediato.

Lamentamos los inconvenientes.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Alternativa por Cancelación - Demora - Sobreventa'],
    gdsSystem: 'AMBOS',
    tags: ['cancelacion', 'alternativas', 'reubicacion']
  },
  {
    id: 'demora-compensacion-1',
    title: 'Demora de Vuelo - Compensación',
    content: `Estimado/a [NOMBRE CLIENTE],

En referencia a la demora de su vuelo, procedemos con la compensación correspondiente.

⏰ INFORMACIÓN DE LA DEMORA:
• Vuelo: [NÚMERO VUELO]
• Horario programado: [HORA ORIGINAL]
• Horario real: [HORA REAL]
• Tiempo de demora: [HORAS] horas

💰 COMPENSACIÓN APLICABLE:
• Según normativa: [NORMATIVA APLICABLE]
• Monto/Beneficio: [DETALLAR]
• Forma de compensación: [EFECTIVO/VOUCHER/OTRO]

📋 PROCESO:
• La compensación será procesada en: [TIEMPO]
• Método de pago: [MÉTODO]
• Recibirá confirmación vía email

Lamentamos los inconvenientes causados por esta demora.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Alternativa por Cancelación - Demora - Sobreventa'],
    gdsSystem: 'AMBOS',
    tags: ['demora', 'compensacion', 'normativa']
  },
  {
    id: 'sobreventa-1',
    title: 'Sobreventa - Compensación y Reubicación',
    content: `Estimado/a [NOMBRE CLIENTE],

Lamentamos informarle sobre la situación de sobreventa en su vuelo.

📊 SITUACIÓN:
• Vuelo con sobreventa: [VUELO]
• Fecha: [FECHA]
• No pudo abordar por capacidad completa

✈️ REUBICACIÓN INMEDIATA:
• Nuevo vuelo: [VUELO]
• Fecha/Hora: [FECHA Y HORA]
• Clase: [CLASE - UPGRADE SI APLICA]

💰 COMPENSACIÓN POR SOBREVENTA:
• Según normativa: [NORMATIVA]
• Compensación económica: [MONTO]
• Voucher adicional: [VALOR] (si aplica)
• Servicios cortesía: [DETALLAR]

✅ TICKET ACTUALIZADO:
• Nuevo ticket emitido: [NÚMERO]
• Sin costo adicional
• Upgrade de clase (si aplica)

Ofrecemos nuestras más sinceras disculpas por este inconveniente.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Alternativa por Cancelación - Demora - Sobreventa'],
    gdsSystem: 'AMBOS',
    tags: ['sobreventa', 'compensacion', 'reubicacion']
  },

  // ===== DEVOLUCIÓN =====
  {
    id: 'devolucion-iniciada-1',
    title: 'Devolución Iniciada - En Proceso',
    content: `Estimado/a [NOMBRE CLIENTE],

Su solicitud de devolución ha sido procesada e iniciada.

📋 INFORMACIÓN DE DEVOLUCIÓN:
• Ticket a devolver: [NÚMERO TICKET]
• Tipo de devolución: [VOLUNTARIA/INVOLUNTARIA]
• Canal: [PW/APP/BSP/ARC]
• Fecha de solicitud: [FECHA]

💰 MONTO A DEVOLVER:
• Tarifa: [MONTO]
• Taxes reembolsables: [MONTO]
• Cargo por devolución: [MONTO O "No aplica"]
• Total a devolver: [MONTO NETO]

⏱️ TIEMPO ESTIMADO:
• Procesamiento BSP/ARC: 5-7 días hábiles
• Acreditación bancaria: 30-45 días hábiles
• Devolución completa: Hasta 45 días

✅ PRÓXIMOS PASOS:
• Recibirá email de confirmación del BSP/ARC
• Acreditación en forma de pago original: [MÉTODO]

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Proceso o Estado de Devolución (PW/APP/BSP/ARC)'],
    gdsSystem: 'AMBOS',
    tags: ['devolucion', 'proceso', 'bsp', 'arc']
  },
  {
    id: 'devolucion-estado-1',
    title: 'Estado de Devolución - Consulta',
    content: `Estimado/a [NOMBRE CLIENTE],

En respuesta a su consulta sobre el estado de su devolución:

📊 ESTADO ACTUAL:
• Ticket: [NÚMERO TICKET]
• Solicitud recibida: [FECHA SOLICITUD]
• Estado: [EN PROCESO/APROBADA/PENDIENTE VALIDACIÓN]
• Canal de devolución: [PW/APP/BSP/ARC]

✅ PROGRESO:
• ✓ Solicitud recibida
• ✓ Validación tarifaria completada
• [✓/⏳] Aprobación BSP/ARC
• [✓/⏳] Procesamiento de pago
• [✓/⏳] Acreditación bancaria

⏱️ TIEMPOS ESTIMADOS:
• Fecha estimada de acreditación: [FECHA ESTIMADA]
• Días transcurridos: [DÍAS]
• Días restantes: [DÍAS]

Para información más detallada, contacte a nuestro departamento de finanzas.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Proceso o Estado de Devolución (PW/APP/BSP/ARC)'],
    gdsSystem: 'AMBOS',
    tags: ['devolucion', 'estado', 'consulta']
  },

  // ===== SEGMENTOS PASIVOS =====
  {
    id: 'segmentos-pasivos-1',
    title: 'Segmentos Pasivos Corregidos',
    content: `Estimado/a [NOMBRE CLIENTE],

Hemos corregido el problema con los segmentos pasivos en su reserva.

🔧 PROBLEMA IDENTIFICADO:
• PNR: [PNR]
• Segmentos afectados: [SEGMENTOS]
• Status incorrecto: GK/PN/NO
• Sistema: [AMADEUS/SABRE]

✅ CORRECCIÓN APLICADA:
• Segmentos reactivados: [SEGMENTOS]
• Nuevo status: HK (confirmado)
• Clase de reserva: [CLASE]
• Queue removida: [QUEUE]

📋 RESERVA ACTUALIZADA:
• Todos los segmentos: CONFIRMADOS
• Lista de espera: NO
• Asientos: [ASIGNADOS/POR ASIGNAR]

Puede proceder con el check-in normalmente.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Segmentos Pasivos - Error BUNDLE'],
    gdsSystem: 'AMBOS',
    tags: ['segmentos', 'pasivos', 'corregido']
  },

  // ===== COBRO ERRÓNEO ATO =====
  {
    id: 'cobro-erroneo-1',
    title: 'Cobro Erróneo ATO - Ajuste Procesado',
    content: `Estimado/a [NOMBRE CLIENTE],

Hemos identificado y corregido el cobro erróneo en su transacción.

❌ COBRO INCORRECTO IDENTIFICADO:
• Fecha de transacción: [FECHA]
• Monto cobrado: [MONTO INCORRECTO]
• Concepto: [CONCEPTO]
• ATO de origen: [ATO]

✅ CORRECCIÓN REALIZADA:
• Monto correcto: [MONTO CORRECTO]
• Diferencia: [DIFERENCIA]
• Nota de crédito emitida: [NÚMERO NC]

💰 DEVOLUCIÓN DE DIFERENCIA:
• Monto a devolver: [MONTO]
• Método: [FORMA DE PAGO ORIGINAL]
• Tiempo estimado: 5-10 días hábiles

📄 DOCUMENTACIÓN:
• Comprobante de ajuste enviado a: [EMAIL]

Lamentamos sinceramente este inconveniente.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Cobro Erróneo ATO - No corresponde'],
    gdsSystem: 'AMBOS',
    tags: ['cobro', 'error', 'ato', 'devolucion']
  },

  // ===== CHECK-IN =====
  {
    id: 'checkin-asistencia-1',
    title: 'Check-in Procesado Exitosamente',
    content: `Estimado/a [NOMBRE CLIENTE],

Su check-in ha sido procesado exitosamente.

✅ CHECK-IN CONFIRMADO:
• Vuelo: [NÚMERO VUELO]
• Fecha: [FECHA]
• Ruta: [ORIGEN - DESTINO]

🎫 TARJETA(S) DE EMBARQUE:
• Pasajero: [NOMBRE]
• Asiento asignado: [NÚMERO ASIENTO]
• Puerta de embarque: [PUERTA]
• Hora de abordaje: [HORA]

📱 ENVIADO A:
• Email: [EMAIL]
• También puede descargar desde la app

🧳 EQUIPAJE:
• Equipaje de mano: [CANTIDAD Y PESO]
• Equipaje en bodega: [CANTIDAD Y PESO]

¡Buen viaje!

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Check-in'],
    gdsSystem: 'AMBOS',
    tags: ['checkin', 'confirmado', 'boarding-pass']
  },

  // ===== ESCALAMIENTO FINANZAS =====
  {
    id: 'escalamiento-finanzas-1',
    title: 'Caso Escalado a Departamento de Finanzas',
    content: `Estimado/a [NOMBRE CLIENTE],

Su caso ha sido escalado al departamento de finanzas para atención especializada.

📋 INFORMACIÓN DEL ESCALAMIENTO:
• Ticket de escalamiento: FIN-[NÚMERO]
• Motivo: [FACTURACIÓN/ATO/OTRO]
• PNR/Ticket afectado: [NÚMERO]
• Prioridad: [NORMAL/ALTA/URGENTE]

👥 EQUIPO ASIGNADO:
• Departamento: Finanzas
• Analista asignado: [NOMBRE] (se le contactará)
• Teléfono directo: [TELÉFONO]
• Email: finanzas@[DOMINIO]

⏱️ TIEMPOS DE RESPUESTA:
• Primera respuesta: 24-48 horas hábiles
• Resolución estimada: 3-5 días hábiles

📧 CANAL DE COMUNICACIÓN:
El equipo de finanzas se contactará directamente con usted a: [EMAIL]

Agradecemos su paciencia.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Escalamiento Finanzas - Facturación -ATO'],
    gdsSystem: 'AMBOS',
    tags: ['escalamiento', 'finanzas', 'facturacion']
  },

  // ===== ACM (CREDIT MEMO) =====
  {
    id: 'acm-1',
    title: 'ACM Procesado - Devolución Parcial',
    content: `Estimado/a [NOMBRE CLIENTE],

Se ha procesado el ACM (Agent Credit Memo) para su caso.

📄 INFORMACIÓN DEL ACM:
• Número de ACM: [NÚMERO ACM]
• Fecha de emisión: [FECHA]
• Ticket relacionado: [NÚMERO TICKET]
• PNR: [PNR]

💰 DEVOLUCIÓN:
• Concepto: [CONCEPTO - DEV BSP/ARC/PAGO EXCESO]
• Monto: [MONTO]
• Procesado vía: [BSP/ARC]

⏱️ ACREDITACIÓN:
• BSP/ARC: 5-7 días hábiles
• Banco: 30-45 días hábiles
• Forma de pago original: [MÉTODO]

📧 Documentación enviada a: [EMAIL]

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['ACM (Dev BSP/ARC/Pago Exceso)'],
    gdsSystem: 'AMBOS',
    tags: ['acm', 'credit-memo', 'devolucion']
  },

  // ===== PNR HX =====
  {
    id: 'pnr-hx-1',
    title: 'PNR con Status HX - Información',
    content: `Estimado/a [NOMBRE CLIENTE],

En referencia a su consulta sobre el PNR con status HX (History):

ℹ️ SIGNIFICADO DE HX:
• Status: History / Histórico
• Significa: Vuelo ya realizado o cancelado
• No es utilizable para nuevas emisiones

🔍 ANÁLISIS DE SU CASO:
• PNR: [PNR]
• Segmentos HX: [SEGMENTOS]
• Fecha del vuelo: [FECHA]
• Motivo del HX: [CANCELADO/VOLADO/EXPIRADO]

✅ SOLUCIÓN:
[OPCIÓN 1: Si requiere nuevo vuelo]
• Se debe crear nueva reserva
• PNR nuevo: [PNR NUEVO]
• Confirmado y listo para emisión

[OPCIÓN 2: Si es consulta histórica]
• Información preservada en el sistema
• Disponible para consultas
• No requiere acción adicional

Por favor indíquenos si requiere asistencia adicional.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['PNR HX'],
    gdsSystem: 'AMBOS',
    tags: ['pnr', 'hx', 'history', 'status']
  },

  // ===== INGRESO APP =====
  {
    id: 'ingreso-app-1',
    title: 'Error en APP - Solucionado',
    content: `Estimado/a [NOMBRE CLIENTE],

Hemos resuelto el error reportado en la aplicación.

🔧 PROBLEMA IDENTIFICADO:
• Tipo de error: [TIPO ERROR]
• Afectaba: [FUNCIONALIDAD]
• ATO involucrado: [ATO] (si aplica)

✅ SOLUCIÓN APLICADA:
• Error corregido en sistema
• Caché limpiado
• Sesión restablecida
• Validado funcionamiento

🔐 PRÓXIMOS PASOS:
1. Cierre sesión en la app
2. Vuelva a iniciar sesión
3. Intente nuevamente la operación

Si el problema persiste, favor contactarnos inmediatamente.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Ingreso APP - Error en ATO -Otro'],
    gdsSystem: 'AMBOS',
    tags: ['app', 'error', 'ato', 'solucionado']
  },

  // ===== OTRO =====
  {
    id: 'otro-general-1',
    title: 'Respuesta General - Caso Resuelto',
    content: `Estimado/a [NOMBRE CLIENTE],

En respuesta a su solicitud, le informamos lo siguiente:

📋 ANÁLISIS DEL CASO:
• PNR/Ticket: [NÚMERO]
• Consulta: [DESCRIPCIÓN DE LA CONSULTA]

✅ SOLUCIÓN APLICADA:
[DETALLAR LA SOLUCIÓN ESPECÍFICA APLICADA AL CASO]

📞 INFORMACIÓN ADICIONAL:
[AGREGAR CUALQUIER INFORMACIÓN RELEVANTE]

Si requiere asistencia adicional, estamos a su disposición.

Saludos cordiales,
[NOMBRE ASESOR]`,
    category: 'reclamoIncidente',
    applicableFor: ['Otro'],
    gdsSystem: 'AMBOS',
    tags: ['general', 'otro', 'personalizado']
  },
];

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Obtiene scripts aplicables según el tipo o reclamo seleccionado
 */
export function getApplicableScripts(
  type: 'tipoSolicitud' | 'reclamoIncidente',
  value: string
): ResponseScript[] {
  const scripts = type === 'tipoSolicitud' ? tipoSolicitudScripts : reclamoIncidenteScripts;
  return scripts.filter(script => script.applicableFor.includes(value));
}

/**
 * Busca scripts por palabra clave
 */
export function searchScripts(query: string): ResponseScript[] {
  const allScripts = [...tipoSolicitudScripts, ...reclamoIncidenteScripts];
  const lowerQuery = query.toLowerCase();
  
  return allScripts.filter(script =>
    script.title.toLowerCase().includes(lowerQuery) ||
    script.content.toLowerCase().includes(lowerQuery) ||
    script.tags?.some(tag => tag.includes(lowerQuery)) ||
    script.gdsSystem?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtiene todos los scripts de un sistema GDS específico
 */
export function getScriptsByGDS(gdsSystem: 'AMADEUS' | 'SABRE' | 'AMBOS'): ResponseScript[] {
  const allScripts = [...tipoSolicitudScripts, ...reclamoIncidenteScripts];
  return allScripts.filter(script => 
    script.gdsSystem === gdsSystem || script.gdsSystem === 'AMBOS'
  );
}

/**
 * Estadísticas de scripts disponibles
 */
export function getScriptsStats() {
  return {
    total: tipoSolicitudScripts.length + reclamoIncidenteScripts.length,
    porTipo: tipoSolicitudScripts.length,
    porReclamo: reclamoIncidenteScripts.length,
    amadeus: getScriptsByGDS('AMADEUS').length,
    sabre: getScriptsByGDS('SABRE').length,
    ambos: getScriptsByGDS('AMBOS').length,
  };
}
