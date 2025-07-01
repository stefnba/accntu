import {
    IconTrendingUp,
    IconTrendingDown,
    IconArrowsUpDown,
} from '@tabler/icons-react';

export const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
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