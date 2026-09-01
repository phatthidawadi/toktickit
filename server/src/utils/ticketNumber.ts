/**
 * Generates official Ticket Number in format TKT-YYYY-XXXXXX
 * @param count Number of tickets created in the current year so far (1-indexed sequence number)
 * @param year Optional 4-digit year (defaults to current UTC year)
 */
export function generateTicketNumber(count: number, year: number = new Date().getFullYear()): string {
  const paddedSequence = String(count).padStart(6, "0");
  return `TKT-${year}-${paddedSequence}`;
}
