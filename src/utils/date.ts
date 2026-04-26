/**
 * Local-timezone date helpers. Streak math intentionally uses the user's local
 * date boundary so a habit completed at 11pm in NYC counts for that NYC day,
 * not the UTC day that already rolled over.
 */

export function todayLocal(): string {
  return formatLocal(new Date());
}

export function formatLocal(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

export function parseLocal(ymd: string): Date {
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

export function addDays(ymd: string, n: number): string {
  const d = parseLocal(ymd);
  d.setDate(d.getDate() + n);
  return formatLocal(d);
}

export function diffDays(aYmd: string, bYmd: string): number {
  const a = parseLocal(aYmd).getTime();
  const b = parseLocal(bYmd).getTime();
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

export function isWeekend(ymd: string): boolean {
  const dow = parseLocal(ymd).getDay();
  return dow === 0 || dow === 6;
}

export function isWeekday(ymd: string): boolean {
  return !isWeekend(ymd);
}

export function dayOfWeek(ymd: string): number {
  return parseLocal(ymd).getDay();
}

export function startOfMonth(ymd: string): string {
  const d = parseLocal(ymd);
  return formatLocal(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function endOfMonth(ymd: string): string {
  const d = parseLocal(ymd);
  return formatLocal(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function daysInMonth(ymd: string): number {
  const d = parseLocal(ymd);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function monthRange(anchorYmd: string): string[] {
  const start = parseLocal(startOfMonth(anchorYmd));
  const total = daysInMonth(anchorYmd);
  const out: string[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(formatLocal(d));
  }
  return out;
}

export function lastNDays(n: number, anchor: string = todayLocal()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDays(anchor, -i));
  }
  return out;
}
