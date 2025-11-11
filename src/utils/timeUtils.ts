/**
 * Utilidades para el cálculo de tiempos transcurridos
 */

/**
 * Calcula el tiempo transcurrido desde una fecha específica
 * @param fechaInicio - Fecha de inicio
 * @param fechaFin - Fecha de fin (opcional, por defecto es ahora)
 * @returns String formateado del tiempo transcurrido
 */
export const calcularTiempoTranscurrido = (fechaInicio: Date, fechaFin?: Date): string => {
  const ahora = fechaFin || new Date();
  const diffMs = ahora.getTime() - fechaInicio.getTime();
  const diffMinutos = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutos < 60) {
    return `${diffMinutos} min`;
  } else if (diffMinutos < 1440) { // Menos de 24 horas
    const horas = Math.floor(diffMinutos / 60);
    const minutos = diffMinutos % 60;
    return `${horas}h ${minutos}min`;
  } else {
    const dias = Math.floor(diffMinutos / 1440);
    const horas = Math.floor((diffMinutos % 1440) / 60);
    return `${dias}d ${horas}h`;
  }
};

/**
 * Calcula el tiempo transcurrido desde el último cambio de estado
 * @param statusChangedAt - Fecha del último cambio de estado
 * @param fechaFin - Fecha de fin (opcional, por defecto es ahora)
 * @returns String formateado del tiempo transcurrido por estado
 */
export const calcularTiempoPorEstado = (statusChangedAt?: Date, fechaFin?: Date): string => {
  if (!statusChangedAt) {
    return 'N/A';
  }
  return calcularTiempoTranscurrido(statusChangedAt, fechaFin);
};

/**
 * Calcula el tiempo total transcurrido desde la creación del requerimiento
 * @param initialDate - Fecha de creación del requerimiento
 * @param fechaFin - Fecha de fin (opcional, por defecto es ahora)
 * @returns String formateado del tiempo total transcurrido
 */
export const calcularTiempoTotal = (initialDate: Date, fechaFin?: Date): string => {
  return calcularTiempoTranscurrido(initialDate, fechaFin);
};

/**
 * Formatea una fecha para mostrar en formato legible
 * @param fecha - Fecha a formatear
 * @returns String formateado de la fecha
 */
export const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

