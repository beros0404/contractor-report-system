import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

// ============ FUNCIONES PARA MANEJO DE FECHAS EN COLOMBIA (UTC-5) ============

/**
 * Convierte una fecha en formato YYYY-MM-DD a una fecha con zona horaria de Colombia (UTC-5)
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns String con formato ISO con zona horaria -05:00
 */
export function toColombiaDate(dateString: string): string {
  return `${dateString}T00:00:00-05:00`
}

/**
 * Formatea una fecha para mostrar en la interfaz (zona horaria local)
 * @param date - Fecha en string o Date
 * @returns Fecha formateada como "dd de mes de yyyy"
 */
export function formatColombiaDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

/**
 * Obtiene la fecha actual en Colombia (UTC-5)
 * @returns Fecha en formato YYYY-MM-DD
 */
export function getCurrentColombiaDate(): string {
  const now = new Date()
  // Ajustar a UTC-5 (Colombia)
  const colombiaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000))
  const year = colombiaTime.getUTCFullYear()
  const month = String(colombiaTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(colombiaTime.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha para input type="date"
 * @param date - Fecha en string o Date
 * @returns Fecha en formato YYYY-MM-DD
 */
export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}