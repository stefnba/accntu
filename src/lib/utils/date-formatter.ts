import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import calendar from 'dayjs/plugin/calendar';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import relativeTime from 'dayjs/plugin/relativeTime';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(calendar);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(dayOfYear);
dayjs.extend(quarterOfYear);
dayjs.extend(isoWeek);

const NA_STRING = 'N/A';

export const DATE_FORMATS = {
    DEFAULT_DATE: 'D-MMM YYYY',
    /** e.g., 15-January-2024 */
    FULL_DATE: 'DD-MMMM-YYYY',
    /** e.g., 15-January-2024, 14:30 */
    FULL_DATE_TIME: 'DD-MMMM-YYYY, HH:mm',
    /** e.g., 15/01/2024 */
    SHORT_DATE: 'DD/MM/YYYY',
    /** e.g., 01/15/2024 */
    SHORT_DATE_ALT: 'MM/DD/YYYY',
    /** e.g., 2024-01-15 14:30:00 */
    API_TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
    /** e.g., 2024-01-15T14:30:00.000Z */
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    /** e.g., 2:30 PM */
    TIME_12H: 'h:mm A',
    /** e.g., 14:30 */
    TIME_24H: 'HH:mm',
    /** e.g., Monday, January 15 */
    DAY_MONTH: 'dddd, MMMM D',
    /** e.g., January 2024 */
    MONTH_YEAR: 'MMMM YYYY',
    /** e.g., Jan 15, 2024 */
    MONTH_DAY_YEAR: 'MMM DD, YYYY',
    /** e.g., Jan 15, 2024 */
    SHORT_MONTH_DAY_YEAR: 'MMM D, YYYY',
    /** e.g., Jan 15, 2024, 2:30:00 PM */
    SHORT_MONTH_DAY_YEAR_TIME: 'MMM D, YYYY, h:mm:ss a',
} as const;

export type TDateFormatKeys = keyof typeof DATE_FORMATS;
export type TDateFormatValues = (typeof DATE_FORMATS)[TDateFormatKeys];

class DateFormatter {
    private inputDate: string | Date | number | undefined | null;
    private _date: dayjs.Dayjs | null = null;
    private _isValid: boolean | null = null;

    constructor(date: string | Date | number | undefined | null) {
        this.inputDate = date;
    }

    private get date(): dayjs.Dayjs | null {
        if (this._date === null && this.inputDate) {
            this._date = dayjs(this.inputDate);
        }
        return this._date;
    }

    private get isValid(): boolean {
        if (this._isValid === null) {
            this._isValid = this.date ? this.date.isValid() : false;
        }
        return this._isValid;
    }

    private process<T>(
        valueGetter: (date: dayjs.Dayjs) => T,
        defaultValue: T | string = NA_STRING
    ): T | string {
        if (!this.isValid || !this.date) {
            return defaultValue;
        }
        return valueGetter(this.date);
    }

    // --- Formatters ---

    /**
     * Formats the date using a custom format string.
     * @param formatStr The key of the format string from `DATE_FORMATS`.
     * @returns The formatted date string, or 'N/A'.
     */
    format(formatStr: TDateFormatKeys): string {
        return this.process((d) => d.format(DATE_FORMATS[formatStr]));
    }

    /**
     * Formats the date to a full date string.
     * @returns The formatted date string (e.g., '15-January-2024'), or 'N/A'.
     */
    toDateString(): string {
        return this.process((d) => d.format(DATE_FORMATS.FULL_DATE));
    }

    /**
     * Formats the date to a full date and time string.
     * @returns The formatted date-time string (e.g., '15-January-2024, 14:30'), or 'N/A'.
     */
    toDateTimeString(): string {
        return this.process((d) => d.format(DATE_FORMATS.FULL_DATE_TIME));
    }

    /**
     * Formats the date as a relative time from now (e.g., "2 hours ago").
     * @returns The relative time string, or 'N/A'.
     */
    relativeTime(): string {
        return this.process((d) => d.fromNow());
    }

    /**
     * Formats the date as a relative time from a base date.
     * @param baseDate The date to compare against.
     * @returns The relative time string, or 'N/A'.
     */
    relativeTo(baseDate: string | Date | number): string {
        return this.process((d) => d.from(dayjs(baseDate)));
    }

    /**
     * Formats as relative time if recent, otherwise as a standard date string.
     * @param thresholdDays The number of days to consider "recent".
     * @returns The formatted smart date string, or 'N/A'.
     */
    smart(thresholdDays = 7): string {
        return this.process((d) => {
            const now = dayjs();
            const diffDays = Math.abs(d.diff(now, 'day'));
            return diffDays <= thresholdDays ? d.fromNow() : d.format(DATE_FORMATS.FULL_DATE);
        });
    }

    /**
     * Formats using calendar-style time (e.g., "Today at 2:30 PM").
     * @returns The calendar-formatted string, or 'N/A'.
     */
    calendar(): string {
        return this.process((d) =>
            d.calendar(null, {
                sameDay: '[Today at] h:mm A',
                nextDay: '[Tomorrow at] h:mm A',
                nextWeek: 'dddd [at] h:mm A',
                lastDay: '[Yesterday at] h:mm A',
                lastWeek: '[Last] dddd [at] h:mm A',
                sameElse: 'MMM D, YYYY [at] h:mm A',
            })
        );
    }

    /**
     * Formats to a short date string (e.g., "01/15/2024").
     * @returns The short date string, or 'N/A'.
     */
    short(): string {
        return this.process((d) => d.format(DATE_FORMATS.SHORT_DATE_ALT));
    }

    /**
     * Formats to a timestamp string for technical contexts (e.g., "2024-01-15 14:30:00").
     * @returns The timestamp string, or 'N/A'.
     */
    timestamp(): string {
        return this.process((d) => d.format(DATE_FORMATS.API_TIMESTAMP));
    }

    /**
     * Formats the time only (e.g., "2:30 PM").
     * @returns The formatted time string, or 'N/A'.
     */
    time(): string {
        return this.process((d) => d.format(DATE_FORMATS.TIME_12H));
    }

    /**
     * Converts the date to an ISO 8601 string.
     * @returns The ISO formatted string, or 'N/A'.
     */
    iso(): string {
        return this.process((d) => d.toISOString());
    }

    /**
     * Gets the Unix timestamp (seconds since epoch).
     * @returns The Unix timestamp, or 'N/A'.
     */
    unix(): number | string {
        return this.process((d) => d.unix());
    }

    // --- Getters ---

    /**
     * Gets the year.
     * @returns The four-digit year, or 'N/A'.
     */
    year(): number | string {
        return this.process((d) => d.year());
    }

    /**
     * Gets the month (1-12).
     * @returns The month number, or 'N/A'.
     */
    month(): number | string {
        return this.process((d) => d.month() + 1); // 1-indexed
    }

    /**
     * Gets the full or short month name.
     * @param short If true, returns the short month name (e.g., "Jan").
     * @returns The month name, or 'N/A'.
     */
    monthName(short = false): string {
        return this.process((d) => d.format(short ? 'MMM' : 'MMMM'));
    }

    /**
     * Gets the day of the month (1-31).
     * @returns The day of the month, or 'N/A'.
     */
    dayOfMonth(): number | string {
        return this.process((d) => d.date());
    }

    /**
     * Gets the day of the week (0=Sun, 6=Sat).
     * @returns The day of the week, or 'N/A'.
     */
    dayOfWeek(): number | string {
        return this.process((d) => d.day()); // 0=Sun, 6=Sat
    }

    /**
     * Gets the full or short day of the week name.
     * @param short If true, returns the short day name (e.g., "Mon").
     * @returns The day name, or 'N/A'.
     */
    dayOfWeekName(short = false): string {
        return this.process((d) => d.format(short ? 'ddd' : 'dddd'));
    }

    /**
     * Gets the day of the year.
     * @returns The day of the year, or 'N/A'.
     */
    dayOfYear(): number | string {
        return this.process((d) => d.dayOfYear());
    }

    /**
     * Gets the week of the year.
     * @returns The week of the year, or 'N/A'.
     */
    weekOfYear(): number | string {
        return this.process((d) => d.week());
    }

    /**
     * Gets the quarter of the year (1-4).
     * @returns The quarter, or 'N/A'.
     */
    quarter(): number | string {
        return this.process((d) => d.quarter());
    }

    /**
     * Gets the number of days in the current month.
     * @returns The number of days, or 'N/A'.
     */
    daysInMonth(): number | string {
        return this.process((d) => d.daysInMonth());
    }

    // --- Booleans ---

    /**
     * Checks if the date is in the past.
     * @returns True if the date is before now, otherwise false.
     */
    isPast(): boolean {
        return this.process((d) => d.isBefore(dayjs()), false) as boolean;
    }

    /**
     * Checks if the date is in the future.
     * @returns True if the date is after now, otherwise false.
     */
    isFuture(): boolean {
        return this.process((d) => d.isAfter(dayjs()), false) as boolean;
    }

    /**
     * Checks if the date is today.
     * @returns True if the date is the same as today, otherwise false.
     */
    isToday(): boolean {
        return this.process((d) => d.isSame(dayjs(), 'day'), false) as boolean;
    }

    /**
     * Checks if the date is the same as another date.
     * @param otherDate The date to compare with.
     * @param unit The unit to compare on (e.g., 'day', 'month').
     * @returns True if dates are the same, otherwise false.
     */
    isSame(otherDate: string | Date | number, unit: dayjs.OpUnitType = 'day'): boolean {
        return this.process((d) => d.isSame(otherDate, unit), false) as boolean;
    }

    /**
     * Checks if the date is after another date.
     * @param otherDate The date to compare with.
     * @param unit The unit to compare on.
     * @returns True if the date is after, otherwise false.
     */
    isAfter(otherDate: string | Date | number, unit: dayjs.OpUnitType = 'day'): boolean {
        return this.process((d) => d.isAfter(otherDate, unit), false) as boolean;
    }

    /**
     * Checks if the date is before another date.
     * @param otherDate The date to compare with.
     * @param unit The unit to compare on.
     * @returns True if the date is before, otherwise false.
     */
    isBefore(otherDate: string | Date | number, unit: dayjs.OpUnitType = 'day'): boolean {
        return this.process((d) => d.isBefore(otherDate, unit), false) as boolean;
    }

    /**
     * Checks if the date is the same as or after another date.
     * @param otherDate The date to compare with.
     * @param unit The unit to compare on.
     * @returns True if the date is same or after, otherwise false.
     */
    isSameOrAfter(otherDate: string | Date | number, unit: dayjs.OpUnitType = 'day'): boolean {
        return this.process((d) => d.isSameOrAfter(otherDate, unit), false) as boolean;
    }

    /**
     * Checks if the date is the same as or before another date.
     * @param otherDate The date to compare with.
     * @param unit The unit to compare on.
     * @returns True if the date is same or before, otherwise false.
     */
    isSameOrBefore(otherDate: string | Date | number, unit: dayjs.OpUnitType = 'day'): boolean {
        return this.process((d) => d.isSameOrBefore(otherDate, unit), false) as boolean;
    }

    // --- Raw Output ---

    /**
     * Returns the native JavaScript Date object.
     * @returns The Date object, or null if invalid.
     */
    toDateObject(): Date | null {
        return (this.process((d) => d.toDate(), null) as Date) || null;
    }

    /**
     * Returns the underlying Dayjs object for further manipulation.
     * @returns The Dayjs object, or null if invalid.
     */
    toDayjsObject(): dayjs.Dayjs | null {
        return (this.process((d) => d, null) as dayjs.Dayjs) || null;
    }
}

export const formatDate = (date: string | Date | number | undefined | null) => {
    return new DateFormatter(date);
};
