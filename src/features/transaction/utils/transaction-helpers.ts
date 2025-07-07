import { IconArrowsUpDown, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { format } from 'date-fns';

export const formatCurrency = (amount: number, currency: string) => {
    // Fallback for invalid currency to prevent crashes
    if (!currency || currency.length !== 3) {
        console.warn(`Invalid currency code provided: "${currency}". Falling back to 'USD'.`);

        currency = 'USD';
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(amount);
    } catch (error) {
        console.error(`Error formatting currency:`, { amount, currency, error });
        // Return a simple formatted string as a last resort
        return `${currency} ${amount.toFixed(2)}`;
    }
};

export const getTypeIcon = (type: string) => {
    switch (type) {
        case 'credit':
            return IconTrendingUp;
        case 'debit':
            return IconTrendingDown;
        default:
            return IconArrowsUpDown;
    }
};

export const getTypeColor = (type: string) => {
    switch (type) {
        case 'credit':
            return 'text-green-600';
        case 'debit':
            return 'text-red-600';
        default:
            return 'text-foreground';
    }
};

export const getAmountWithSign = (amount: number, type: string) => {
    return type === 'debit' ? -Math.abs(amount) : Math.abs(amount);
};

export const getTypeBadgeVariant = (type: string) => {
    switch (type) {
        case 'credit':
            return 'default' as const;
        case 'debit':
            return 'destructive' as const;
        default:
            return 'secondary' as const;
    }
};

export const formatDateSafe = (
    dateValue: string | null | undefined | Date,
    formatString: string,
    fallback = 'Invalid date'
) => {
    if (!dateValue) return fallback;

    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            return fallback;
        }
        return format(date, formatString);
    } catch (error) {
        console.warn('Date formatting error:', error);
        return fallback;
    }
};
