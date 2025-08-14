import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface BankLogoProps {
    color?: string | null;
    logoUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
}

export const BankLogo = ({ color, logoUrl, size = 'md' }: BankLogoProps) => {
    const sizeClass = {
        sm: 'size-8',
        md: 'size-12',
        lg: 'size-20',
    }[size];

    if (!logoUrl) {
        const sizeClassIcon = {
            sm: 'size-4',
            md: 'size-6',
            lg: 'size-10',
        }[size];

        return (
            <div
                className={cn(
                    'rounded-2xl bg-gray-50 flex items-center justify-center shadow-sm border',
                    sizeClass
                )}
            >
                <Building2 className={cn('text-gray-600', sizeClassIcon)} />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'rounded-2xl flex items-center justify-center shadow-sm border',
                sizeClass
            )}
            style={{
                backgroundColor: color || '#f8fafc',
            }}
        >
            <img src={logoUrl} alt="Bank Logo" className="size-12 object-contain" />
        </div>
    );
};
