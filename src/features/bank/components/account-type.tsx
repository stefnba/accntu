import { Badge } from '@/components/ui/badge';
import { TGlobalBankAccount } from '@/features/bank/server/db/schemas';
import { cn } from '@/lib/utils';
import { Building2, CreditCard, LucideIcon, TrendingUp, Wallet } from 'lucide-react';

type TAccountType = TGlobalBankAccount['type'];

interface AccountTypeIconProps {
    accountType: TAccountType;
}

const colorMapping: Record<
    TAccountType | 'default',
    {
        text: string;
        bg: string;
        border: string;
    }
> = {
    checking: {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
    },
    savings: {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
    },
    credit_card: {
        text: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
    },
    investment: {
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
    },
    default: {
        text: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
    },
};

const iconMapping: Record<TAccountType | 'default', LucideIcon> = {
    checking: Wallet,
    savings: Building2,
    credit_card: CreditCard,
    investment: TrendingUp,
    default: Wallet,
};

export const AccountTypeIcon: React.FC<AccountTypeIconProps> = ({ accountType }) => {
    const color = colorMapping[accountType] || colorMapping.default;
    const Icon = iconMapping[accountType] || iconMapping.default;

    return (
        <div className={cn(color.bg, color.border, color.text, 'rounded-md p-2')}>
            <Icon className="size-4 bg-blue-500" />
        </div>
    );
};

interface AccountTypeBadgeProps extends AccountTypeIconProps {
    name: string;
    info?: string | React.ReactNode;
}

export const AccountTypeBadge: React.FC<AccountTypeBadgeProps> = ({ accountType, name, info }) => {
    const colors = colorMapping[accountType] || colorMapping.default;
    const Icon = iconMapping[accountType] || iconMapping.default;

    const colorA = '#155dfc';

    return (
        <Badge className={cn(colors.bg, colors.border, colors.text, 'flex items-center gap-1')}>
            <div className={cn('rounded-md p-1')}>
                <Icon className="size-5" />
            </div>
            <span className="text-xs font-medium">{name}</span>
            {info && (
                <div
                    className={cn(
                        `text-xs text-white rounded-full size-5 bg-[${colorA}] opacity-10  flex items-center justify-center`
                    )}
                >
                    {info}
                </div>
            )}
        </Badge>
    );
};
