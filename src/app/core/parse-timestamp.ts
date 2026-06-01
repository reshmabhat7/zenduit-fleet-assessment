/**
 * Parses a timestamp into a Date, tolerating the formats that actually appear
 * in the dataset: ISO 8601 strings plus the occasional raw Unix epoch (seconds
 * or milliseconds) that slips through from the GPS device feed.
 * Returns null for anything unparseable.
 */
export function parseTimestamp(value: string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null;

  // Raw epoch — numeric value or an all-digits string.
  if (typeof value === 'number' || /^\d+$/.test(value)) {
    const n = Number(value);
    const ms = n < 1e12 ? n * 1000 : n; // 10-digit values are seconds
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}
