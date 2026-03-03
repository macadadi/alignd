/** Returns "1 X" or "N Y" based on count (singular when 1, plural otherwise). */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`
}
