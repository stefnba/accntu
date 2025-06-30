'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Eye, EyeOff, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface BankCardProps {
    id: string;
    bankName: string;
    bankIcon?: string;
    accountNumber: string;
    accountHolderName: string;
    expiryDate?: string;
    accountType?: string;
    isActive?: boolean;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onToggleVisibility?: (id: string) => void;
}

export const BankCard = ({
    id,
    bankName,
    bankIcon,
    accountNumber,
    accountHolderName,
    expiryDate,
    accountType = 'Checking',
    isActive = true,
    onEdit,
    onDelete,
    onToggleVisibility,
}: BankCardProps) => {
    const [isNumberVisible, setIsNumberVisible] = useState(false);

    const maskedAccountNumber = accountNumber.replace(/\d(?=\d{4})/g, '*');
    const formattedAccountNumber = accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    const displayAccountNumber = isNumberVisible ? formattedAccountNumber : maskedAccountNumber;

    const handleToggleVisibility = () => {
        setIsNumberVisible(!isNumberVisible);
        onToggleVisibility?.(id);
    };

    return (
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg group">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {bankIcon ? (
                                <img
                                    src={bankIcon}
                                    alt={`${bankName} logo`}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-white" />
                                </div>
                            )}
                            {isActive && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-foreground">{bankName}</h3>
                            <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                                {accountType}
                            </Badge>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">More options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onEdit?.(id)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Edit Account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleToggleVisibility}>
                                {isNumberVisible ? (
                                    <EyeOff className="w-4 h-4 mr-2" />
                                ) : (
                                    <Eye className="w-4 h-4 mr-2" />
                                )}
                                {isNumberVisible ? 'Hide' : 'Show'} Number
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            <DropdownMenuItem
                                onClick={() => onDelete?.(id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Account
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-4">
                    <div className="font-mono text-2xl font-semibold tracking-wider text-foreground">
                        {displayAccountNumber}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div>
                            <p className="font-medium text-foreground">{accountHolderName}</p>
                        </div>
                        {expiryDate && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Exp:</p>
                                <p className="font-medium">{expiryDate}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
