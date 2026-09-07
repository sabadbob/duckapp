// All app time is computed in Asia/Bangkok, regardless of the device's local timezone,
// since George is in Bangkok and the whole app (midnight cutoff, class schedule, pin-up
// countdown) is written around that clock.

const TZ = 'Asia/Bangkok';

function bangkokParts(d: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    weekday: 'short',
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return {
    year: Number(get('year')), month: Number(get('month')), day: Number(get('day')),
    hour: Number(get('hour')) % 24, minute: Number(get('minute')), second: Number(get('second')),
    weekday: get('weekday'),
  };
}

const WEEKDAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export function nowInBangkok() {
  return bangkokParts(new Date());
}

export function bangkokDayIndex(d = new Date()): number {
  return WEEKDAY_INDEX[bangkokParts(d).weekday] ?? 0;
}

export function bangkokDateIso(d = new Date()): string {
  const p = bangkokParts(d);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function bangkokTimeLabel(d = new Date()): string {
  const p = bangkokParts(d);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function isoWeekNumber(d = new Date()): number {
  const p = bangkokParts(d);
  const date = new Date(Date.UTC(p.year, p.month - 1, p.day));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

export function headerDateLabel(d = new Date()): string {
  const p = bangkokParts(d);
  const wd = p.weekday.toUpperCase();
  return `${wd} ${String(p.day).padStart(2, '0')} ${MONTHS[p.month - 1]} · WK ${isoWeekNumber(d)}`;
}

// Monday (ISO date string) of the current Bangkok week.
export function currentWeekStartIso(d = new Date()): string {
  const p = bangkokParts(d);
  const idx = bangkokDayIndex(d); // 0=Mon
  const utcDate = new Date(Date.UTC(p.year, p.month - 1, p.day));
  utcDate.setUTCDate(utcDate.getUTCDate() - idx);
  return utcDate.toISOString().slice(0, 10);
}

// Seconds remaining until the next 00:00 Bangkok time.
export function secondsToMidnight(d = new Date()): number {
  const p = bangkokParts(d);
  return (24 * 3600) - (p.hour * 3600 + p.minute * 60 + p.second);
}

export function midnightCountdownLabel(d = new Date()): string {
  const secs = secondsToMidnight(d);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} TO 00:00`;
}

export function isSameBangkokDate(ts: number, ref = Date.now()): boolean {
  return bangkokDateIso(new Date(ts)) === bangkokDateIso(new Date(ref));
}

export function isSameBangkokWeek(ts: number, ref = Date.now()): boolean {
  return currentWeekStartIso(new Date(ts)) === currentWeekStartIso(new Date(ref));
}

// Next Friday 09:00 Bangkok — the recurring pin-up slot for Arch Design II.
export function daysUntilNextFriday(d = new Date()): number {
  const idx = bangkokDayIndex(d); // 0=Mon..6=Sun
  const p = bangkokParts(d);
  let delta = (4 - idx + 7) % 7; // Friday = index 4
  if (delta === 0 && p.hour >= 9) delta = 7;
  return delta;
}
