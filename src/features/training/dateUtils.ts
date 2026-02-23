/**
 * Format a date string to a localized long format
 * @param dateString - ISO date string or date object
 * @returns Formatted date string (e.g., "Tuesday, February 23, 2026")
 */
export function formatDateLong(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date string to a short format
 * @param dateString - ISO date string or date object
 * @returns Formatted date string (e.g., "2/23/2026")
 */
export function formatDateShort(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString();
}
