'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TransactionWithRelations } from './table-columns';

interface EditableCellProps {
    transaction: TransactionWithRelations;
    field: string;
    value: string | number;
    onEditComplete?: () => void;
}

interface EditableSelectCellProps extends EditableCellProps {
    options: Array<{ id: string; name: string; color?: string }>;
    placeholder?: string;
}

export const EditableTextCell = ({
    transaction,
    field,
    value,
    onEditComplete,
}: EditableCellProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(value || ''));
    const { mutate: updateTransaction } = useTransactionEndpoints.update();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editValue === String(value)) {
            setIsEditing(false);
            return;
        }

        try {
            await updateTransaction({
                param: { id: transaction.id },
                json: { [field]: editValue || null },
            });

            toast.success(`${field} updated`);
            setIsEditing(false);
            onEditComplete?.();
        } catch {
            toast.error(`Failed to update ${field}`);
        }
    };

    const handleCancel = () => {
        setEditValue(String(value || ''));
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div
                className="cursor-pointer hover:bg-muted/30 p-1 rounded min-h-[24px] flex items-center"
                onClick={() => setIsEditing(true)}
                title={`Click to edit ${field}`}
            >
                {value || <span className="text-muted-foreground italic">Click to add</span>}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
            <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 text-sm"
                autoFocus
                onBlur={(e) => {
                    // Only auto-submit if clicking outside (not on buttons)
                    if (!e.relatedTarget?.closest('form')) {
                        handleSubmit(e as any);
                    }
                }}
            />
            <Button type="submit" size="sm" variant="ghost" className="h-6 w-6 p-0">
                <IconCheck className="h-3 w-3" />
            </Button>
            <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleCancel}
            >
                <IconX className="h-3 w-3" />
            </Button>
        </form>
    );
};

export const EditableAmountCell = ({
    transaction,
    field,
    value,
    onEditComplete,
}: EditableCellProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(value || '0'));
    const { mutate: updateTransaction } = useTransactionEndpoints.update();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numericValue = parseFloat(editValue);
        if (isNaN(numericValue) || numericValue === Number(value)) {
            setIsEditing(false);
            return;
        }

        try {
            await updateTransaction({
                param: { id: transaction.id },
                json: { [field]: String(numericValue) },
            });

            toast.success('Amount updated');
            setIsEditing(false);
            onEditComplete?.();
        } catch {
            toast.error('Failed to update amount');
        }
    };

    const handleCancel = () => {
        setEditValue(String(value || '0'));
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div
                className="cursor-pointer hover:bg-muted/30 p-1 rounded text-right"
                onClick={() => setIsEditing(true)}
                title="Click to edit amount"
            >
                {value}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
            <Input
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 text-sm text-right"
                autoFocus
                onBlur={(e) => {
                    if (!e.relatedTarget?.closest('form')) {
                        handleSubmit(e as any);
                    }
                }}
            />
            <Button type="submit" size="sm" variant="ghost" className="h-6 w-6 p-0">
                <IconCheck className="h-3 w-3" />
            </Button>
            <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleCancel}
            >
                <IconX className="h-3 w-3" />
            </Button>
        </form>
    );
};

export const EditableSelectCell = ({
    transaction,
    field,
    value,
    options,
    placeholder = 'Select option',
    onEditComplete,
}: EditableSelectCellProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const { mutate: updateTransaction } = useTransactionEndpoints.update();

    const currentOption = options.find((opt) => opt.id === value);

    const handleValueChange = async (newValue: string) => {
        if (newValue === String(value)) {
            setIsEditing(false);
            return;
        }

        try {
            await updateTransaction({
                param: { id: transaction.id },
                json: { [field]: newValue === 'none' ? null : newValue },
            });

            toast.success(`${field} updated`);
            setIsEditing(false);
            onEditComplete?.();
        } catch {
            toast.error(`Failed to update ${field}`);
        }
    };

    if (!isEditing) {
        return (
            <div
                className="cursor-pointer hover:bg-muted/30 p-1 rounded min-h-[24px] flex items-center"
                onClick={() => setIsEditing(true)}
                title={`Click to edit ${field}`}
            >
                {currentOption ? (
                    <span
                        style={{ color: currentOption.color || undefined }}
                        className="font-medium"
                    >
                        {currentOption.name}
                    </span>
                ) : (
                    <span className="text-muted-foreground italic">Click to select</span>
                )}
            </div>
        );
    }

    return (
        <Select
            defaultValue={String(value || 'none')}
            onValueChange={handleValueChange}
            open={isEditing}
            onOpenChange={setIsEditing}
        >
            <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">
                    <span className="text-muted-foreground">None</span>
                </SelectItem>
                {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                        <span style={{ color: option.color || undefined }}>{option.name}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
