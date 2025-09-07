'use client';

import {
    Form,
    FormCheckbox,
    FormInput,
    FormSelect,
    FormSubmitButton,
    createFormSchema,
    useForm,
} from '@/components/form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAdminGlobalBankEndpoints } from '@/features/admin/api/global-bank';
import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { Building2, X } from 'lucide-react';
import { z } from 'zod';

const globalBankFormSchema = createFormSchema(globalBankServiceSchemas.insert, {
    name: '',
    country: '',
    currency: '',
    bic: '',
    logo: '',
    color: '',
    providerSource: 'manual',
    providerId: '',
    isActive: true,
    integrationTypes: 'csv',
});

interface GlobalBankFormProps {
    bank?: {
        id: string;
        name: string;
        country: string;
        currency: string;
        bic?: string;
        logo?: string;
        color?: string;
        providerSource: string;
        providerId?: string;
        integrationTypes?: string[];
        isActive: boolean;
    };
    onClose: () => void;
}

export const GlobalBankForm = ({ bank, onClose }: GlobalBankFormProps) => {
    const createBank = useAdminGlobalBankEndpoints.create();
    const updateBank = useAdminGlobalBankEndpoints.update();

    const form = useForm({
        schema: bank
            ? globalBankServiceSchemas.update.extend({
                  integrationTypes: z.array(z.string()).optional(),
              })
            : globalBankFormSchema.schema,
        defaultValues: bank
            ? {
                  name: bank.name || '',
                  country: bank.country || '',
                  currency: bank.currency || '',
                  bic: bank.bic || '',
                  logo: bank.logo || '',
                  color: bank.color || '',
                  providerSource: bank.providerSource || 'manual',
                  providerId: bank.providerId || '',
                  integrationTypes: bank.integrationTypes || [],
                  isActive: bank.isActive ?? true,
              }
            : globalBankFormSchema.defaultValues,
        onSubmit: async (data) => {
            if (bank) {
                await updateBank.mutateAsync({
                    param: { id: bank.id },
                    json: data,
                });
            } else {
                await createBank.mutateAsync({
                    json: data,
                });
            }
            onClose();
        },
    });

    const integrationTypes = form.watch('integrationTypes') || [];

    const handleIntegrationTypeToggle = (type: string) => {
        const current = integrationTypes;
        const updated = current.includes(type)
            ? current.filter((t: string) => t !== type)
            : [...current, type];
        form.setValue('integrationTypes', updated);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-gray-900">
                                {bank ? 'Edit Global Bank' : 'Add Global Bank'}
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                {bank
                                    ? 'Update bank template configuration'
                                    : 'Create a new global bank template'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <Form form={form} className="space-y-8 pt-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                form={form}
                                name="name"
                                label="Bank Name"
                                placeholder="Enter bank name"
                                required
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />

                            <FormInput
                                form={form}
                                name="country"
                                label="Country Code"
                                placeholder="DE, CH, etc."
                                maxLength={2}
                                className="uppercase border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />

                            <FormInput
                                form={form}
                                name="currency"
                                label="Currency Code"
                                placeholder="EUR, USD, etc."
                                maxLength={3}
                                className="uppercase border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />

                            <FormInput
                                form={form}
                                name="bic"
                                label="BIC Code"
                                placeholder="DEUTDEFF (Optional)"
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Branding & Visual
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                form={form}
                                name="logo"
                                label="Logo URL"
                                placeholder="https://example.com/logo.png (Optional)"
                                type="url"
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />

                            <FormInput
                                form={form}
                                name="color"
                                label="Brand Color"
                                placeholder="#0066cc (Optional)"
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Provider Configuration */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Provider Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                form={form}
                                name="providerSource"
                                label="Provider Source"
                                placeholder="Select provider"
                                options={[
                                    { value: 'manual', label: '📁 Manual/CSV Upload' },
                                    { value: 'nordigen', label: '🌐 Nordigen' },
                                    { value: 'plaid', label: '💳 Plaid' },
                                    { value: 'open-banking', label: '🏦 Open Banking' },
                                ]}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />

                            <FormInput
                                form={form}
                                name="providerId"
                                label="Provider ID"
                                placeholder="Provider-specific identifier (Optional)"
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Integration Types */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Integration Types
                        </h3>
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                                Select supported integration methods:
                            </Label>
                            <div className="flex gap-6">
                                {[
                                    {
                                        value: 'csv',
                                        label: 'CSV Upload',
                                        description: 'Manual file upload',
                                    },
                                    {
                                        value: 'api',
                                        label: 'API Integration',
                                        description: 'Direct API connection',
                                    },
                                ].map((type) => (
                                    <div key={type.value} className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id={type.value}
                                            checked={integrationTypes.includes(type.value)}
                                            onChange={() => handleIntegrationTypeToggle(type.value)}
                                            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={type.value}
                                                className="cursor-pointer font-medium text-gray-900"
                                            >
                                                {type.label}
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {integrationTypes.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                    {integrationTypes.map((type: string) => (
                                        <Badge
                                            key={type}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800"
                                        >
                                            {type.toUpperCase()}
                                            <button
                                                onClick={() => handleIntegrationTypeToggle(type)}
                                                className="ml-1 hover:text-blue-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Status
                        </h3>
                        <FormCheckbox
                            form={form}
                            name="isActive"
                            label="Active Bank"
                            description="Enable this bank template for user connections"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <FormSubmitButton
                            form={form}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {bank ? 'Update Bank' : 'Create Bank'}
                        </FormSubmitButton>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
