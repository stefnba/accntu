import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

// Initialize plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(calendar);

// constants
const DATE_FORMAT = 'DD-MMMM YYYY';
const DATE_TIME_FORMAT = 'DD-MMMM YYYY, HH:mm';

/**
 * Dayjs formatter utilities for consistent date formatting across the app
 */

/**
 * Format a date with a standard format (e.g., "15-Mar 2023")
 * @param date Date to format (string, Date, number, dayjs object)
 * @param format Optional custom format string (defaults to DATE_FORMAT)
 */
export function formatDate(
    date: string | Date | number | undefined | null,
    format = DATE_FORMAT
): string {
    if (!date) return 'N/A';
    return dayjs(date).format(format);
}

/**
 * Format a date with time (e.g., "15-Mar 2023, 15:30")
 * @param date Date to format
 * @param format Optional custom format string (defaults to DATE_TIME_FORMAT)
 */
export function formatDateTime(
    date: string | Date | number | undefined | null,
    format = DATE_TIME_FORMAT
): string {
    if (!date) return 'N/A';
    return dayjs(date).format(format);
}

/**
 * Format a date as a relative time (e.g., "2 hours ago", "in 3 days")
 * @param date Date to format
 * @param baseDate Optional reference date (defaults to now)
 */
export function formatRelativeTime(
    date: string | Date | number | undefined | null,
    baseDate?: string | Date | number
): string {
    if (!date) return 'N/A';
    return baseDate ? dayjs(date).from(dayjs(baseDate)) : dayjs(date).fromNow();
}

/**
 * Format a date as relative time if recent, otherwise use standard date format
 * @param date Date to format
 * @param thresholdDays Number of days to consider "recent" for relative formatting
 */
export function formatSmartDate(
    date: string | Date | number | undefined | null,
    thresholdDays = 7
): string {
    if (!date) return 'N/A';

    const dateObj = dayjs(date);
    const now = dayjs();
    const diffDays = Math.abs(dateObj.diff(now, 'day'));

    if (diffDays <= thresholdDays) {
        return formatRelativeTime(date);
    }

    return formatDate(date);
}

/**
 * Format a date using calendar time (e.g., "Today at 2:30 PM", "Yesterday at 2:30 PM", "Last Monday at 2:30 PM")
 * @param date Date to format
 */
export function formatCalendarTime(date: string | Date | number | undefined | null): string {
    if (!date) return 'N/A';

    return dayjs(date).calendar(null, {
        sameDay: '[Today at] h:mm A',
        nextDay: '[Tomorrow at] h:mm A',
        nextWeek: 'dddd [at] h:mm A',
        lastDay: '[Yesterday at] h:mm A',
        lastWeek: '[Last] dddd [at] h:mm A',
        sameElse: 'MMM D, YYYY [at] h:mm A',
    });
}

/**
 * Get a short date representation (e.g., "03/15/2023")
 * @param date Date to format
 */
export function formatShortDate(date: string | Date | number | undefined | null): string {
    if (!date) return 'N/A';
    return dayjs(date).format('MM/DD/YYYY');
}

/**
 * Format a timestamp for display in logs or technical contexts
 * @param date Date to format
 */
export function formatTimestamp(date: string | Date | number | undefined | null): string {
    if (!date) return 'N/A';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Format a time only (e.g., "3:30 PM")
 * @param date Date to format
 */
export function formatTime(date: string | Date | number | undefined | null): string {
    if (!date) return 'N/A';
    return dayjs(date).format('h:mm A');
}

/**
 * Check if a date is in the past
 * @param date Date to check
 */
export function isPast(date: string | Date | number | undefined | null): boolean {
    if (!date) return false;
    return dayjs(date).isBefore(dayjs());
}

/**
 * Check if a date is in the future
 * @param date Date to check
 */
export function isFuture(date: string | Date | number | undefined | null): boolean {
    if (!date) return false;
    return dayjs(date).isAfter(dayjs());
}

/**
 * Check if a date is today
 * @param date Date to check
 */
export function isToday(date: string | Date | number | undefined | null): boolean {
    if (!date) return false;
    return dayjs(date).isSame(dayjs(), 'day');
}
