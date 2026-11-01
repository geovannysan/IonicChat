import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Normaliza los dos IDs de usuario para formar una clave de conversación
 * consistente sin importar el orden en que se pasen.
 *
 * @example buildChatKey(7, 3) → "3_7"
 * @example buildChatKey(3, 7) → "3_7"
 */
export function buildChatKey(a: number, b: number): string {
  return `${Math.min(a, b)}_${Math.max(a, b)}`;
}

/**
 * Formatea una fecha ISO para mostrar en burbujas de chat.
 * - Hoy     → "14:32"
 * - Ayer    → "Ayer"
 * - Más antiguo → "dd/MM/yyyy"
 */
export function formatChatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: es });
  }

  if (isYesterday(date)) {
    return 'Ayer';
  }

  return format(date, 'dd/MM/yyyy', { locale: es });
}

/**
 * Formatea hora exacta para mostrar dentro de las burbujas.
 * Siempre retorna HH:mm independientemente del día.
 */
export function formatChatTime(isoDate: string): string {
  return format(new Date(isoDate), 'HH:mm', { locale: es });
}

/**
 * Retorna las iniciales (máx. 2 caracteres) de un nombre para usar en Avatar.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
