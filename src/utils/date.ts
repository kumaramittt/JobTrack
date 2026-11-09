/**
 * Application Date & Timezone Utilities
 * Standardized on Asia/Kolkata (IST) default timezone with accurate calendar day calculations.
 */

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date string formatted as YYYY-MM-DD in the specified timezone (defaults to Asia/Kolkata).
 */
export function getTodayDateString(timeZone: string = DEFAULT_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Formats as YYYY-MM-DD
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Safely parse a YYYY-MM-DD string into a Date at midnight local time to avoid UTC-offset shifts.
 */
export function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date();
  const clean = dateStr.trim().slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day, 0, 0, 0, 0);
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Get today's Date at midnight representing the current date in the specified timezone.
 */
export function getTodayDate(timeZone: string = DEFAULT_TIMEZONE): Date {
  const todayYmd = getTodayDateString(timeZone);
  return parseDateString(todayYmd);
}

/**
 * Calculate the exact calendar day difference between two dates.
 * positive = future (target is after from)
 * 0 = today
 * negative = past (target is before from)
 */
export function getDaysDifference(
  targetDateStr: string,
  fromDateStr?: string,
  timeZone: string = DEFAULT_TIMEZONE
): number {
  if (!targetDateStr) return 0;
  const fromYmd = fromDateStr || getTodayDateString(timeZone);
  const targetDate = parseDateString(targetDateStr);
  const fromDate = parseDateString(fromYmd);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffTime = targetDate.getTime() - fromDate.getTime();
  return Math.round(diffTime / msPerDay);
}

export interface CountdownInfo {
  diffDays: number;
  label: string;
  badgeClass: string;
  isToday: boolean;
  isTomorrow: boolean;
  isFuture: boolean;
  isPast: boolean;
  formattedDate: string;
}

/**
 * Standardized countdown calculation shared across Dashboard, Calendar, and Modals.
 */
export function getInterviewCountdownInfo(
  interviewDateStr: string,
  interviewTime?: string,
  timeZone: string = DEFAULT_TIMEZONE
): CountdownInfo {
  const diffDays = getDaysDifference(interviewDateStr, undefined, timeZone);
  const formattedDate = formatDisplayDate(interviewDateStr, { timeZone });

  let label = '';
  let badgeClass = '';

  if (diffDays === 0) {
    label = 'Today!';
    badgeClass = 'bg-rose-500 text-white shadow-xs';
  } else if (diffDays === 1) {
    label = 'Tomorrow';
    badgeClass = 'bg-amber-500 text-white shadow-xs';
  } else if (diffDays > 1) {
    label = `In ${diffDays} days`;
    badgeClass = 'bg-indigo-600 text-white shadow-xs';
  } else if (diffDays === -1) {
    label = 'Yesterday';
    badgeClass = 'bg-slate-500 text-white';
  } else {
    label = `${Math.abs(diffDays)} days ago`;
    badgeClass = 'bg-slate-500 text-white';
  }

  return {
    diffDays,
    label,
    badgeClass,
    isToday: diffDays === 0,
    isTomorrow: diffDays === 1,
    isFuture: diffDays > 0,
    isPast: diffDays < 0,
    formattedDate,
  };
}

/**
 * Format date for single-line display (e.g., "Nov 12, 2026").
 */
export function formatDisplayDate(
  dateStr: string,
  options: {
    timeZone?: string;
    includeDayOfWeek?: boolean;
    format?: 'short' | 'medium';
  } = {}
): string {
  if (!dateStr) return '—';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-');

  // Directly construct date to avoid timezone shift
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (!isNaN(year) && !isNaN(monthIndex) && !isNaN(day)) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const d = new Date(year, monthIndex, day);
      const monthStr = monthNames[monthIndex] || '';
      const dayOfWeekStr = options.includeDayOfWeek ? `${dayNames[d.getDay()]}, ` : '';
      return `${dayOfWeekStr}${monthStr} ${day}, ${year}`;
    }
  }

  return dateStr;
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats month and year for calendar header (e.g. "November 2026")
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
