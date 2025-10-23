'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { TTransaction } from '@/features/transaction/server/db/queries';
import { IconEdit } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BulkUpdateDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTransactions: TTransaction[];
    filterOptions?: {
        labels?: Array<{ id: string; name: string; color: string | null }>;
    };
}

type FieldType = 'text' | 'number' | 'select';

interface FieldConfig {
    key: string;
    label: string;
    type: FieldType;
    options?: Array<{ id: string; name: string; color?: string }>;
}

const BULK_UPDATE_FIELDS: FieldConfig[] = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'note', label: 'Note', type: 'text' },
    { key: 'spendingAmount', label: 'Amount', type: 'number' },
    { key: 'labelId', label: 'Label', type: 'select' },
];

export const TransactionBulkUpdateDrawer = ({
    isOpen,
    onClose,
    selectedTransactions,
    filterOptions,
}: BulkUpdateDrawerProps) => {
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const { mutate: updateTransaction } = useTransactionEndpoints.update();

    const handleFieldToggle = (fieldKey: string, checked: boolean) => {
        if (checked) {
            setSelectedFields((prev) => [...prev, fieldKey]);
        } else {
            setSelectedFields((prev) => prev.filter((key) => key !== fieldKey));
            setFieldValues((prev) => {
                const updated = { ...prev };
                delete updated[fieldKey];
                return updated;
            });
        }
    };

    const handleFieldValueChange = (fieldKey: string, value: string) => {
        setFieldValues((prev) => ({ ...prev, [fieldKey]: value }));
    };

    const handleSubmit = async () => {
        if (selectedFields.length === 0) {
            toast.error('Please select at least one field to update');
            return;
        }

        const updateData: Record<string, string | number | null> = {};
        selectedFields.forEach((fieldKey) => {
            const value = fieldValues[fieldKey];
            if (value !== undefined) {
                // Handle special field types
                if (fieldKey === 'spendingAmount') {
                    updateData[fieldKey] = parseFloat(value).toString();
                } else if (fieldKey === 'labelId') {
                    updateData[fieldKey] = value === 'none' ? null : value;
                } else {
                    updateData[fieldKey] = value || null;
                }
            }
        });

        try {
            // Update each transaction individually
            const updatePromises = selectedTransactions.map((transaction) =>
                updateTransaction({
                    param: { id: transaction.id },
                    json: updateData,
                })
            );

            await Promise.all(updatePromises);

            toast.success(`Updated ${selectedTransactions.length} transactions`);
            onClose();
            setSelectedFields([]);
            setFieldValues({});
        } catch {
            toast.error('Failed to update transactions');
        }
    };

    const renderFieldInput = (field: FieldConfig) => {
        const value = fieldValues[field.key] || '';

        switch (field.type) {
            case 'text':
                return (
                    <Input
                        value={value}
                        onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );

            case 'number':
                return (
                    <Input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );

            case 'select': {
                const options =
                    field.key === 'labelId'
                        ? filterOptions?.labels?.map((l) => ({
                              id: l.id,
                              name: l.name,
                              color: l.color || undefined,
                          })) || []
                        : field.options || [];

                return (
                    <Select
                        value={value}
                        onValueChange={(value) => handleFieldValueChange(field.key, value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">
                                <span className="text-muted-foreground">None</span>
                            </SelectItem>
                            {options.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                    <span style={{ color: option.color || undefined }}>
                                        {option.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            }

            default:
                return null;
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                        <IconEdit className="h-5 w-5" />
                        Bulk Update Transactions
                    </DrawerTitle>
                    <DrawerDescription>
                        Update {selectedTransactions.length} selected transactions. Choose which
                        fields to modify and their new values.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Selected transactions preview */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Selected Transactions</Label>
                        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto p-2 border rounded-md">
                            {selectedTransactions.slice(0, 10).map((transaction) => (
                                <Badge key={transaction.id} variant="secondary" className="text-xs">
                                    {transaction.title}
                                </Badge>
                            ))}
                            {selectedTransactions.length > 10 && (
                                <Badge variant="outline" className="text-xs">
                                    +{selectedTransactions.length - 10} more
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Field selection and editing */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Fields to Update</Label>
                        {BULK_UPDATE_FIELDS.map((field) => {
                            const isSelected = selectedFields.includes(field.key);

                            return (
                                <div key={field.key} className="space-y-3 p-3 border rounded-md">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`field-${field.key}`}
                                            checked={isSelected}
                                            onCheckedChange={(checked) =>
                                                handleFieldToggle(field.key, !!checked)
                                            }
                                        />
                                        <Label
                                            htmlFor={`field-${field.key}`}
                                            className="text-sm font-medium"
                                        >
                                            {field.label}
                                        </Label>
                                    </div>

                                    {isSelected && (
                                        <div className="ml-6">{renderFieldInput(field)}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DrawerFooter>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={selectedFields.length === 0}
                            className="flex-1"
                        >
                            Update {selectedTransactions.length} Transactions
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};
