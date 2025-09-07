'use client';

import {
    Form,
    FormCheckbox,
    FormInput,
    FormSelect,
    FormSubmitButton,
    FormTextarea,
    useForm,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';

interface GlobalBankAccountFormProps {
    accountId?: string;
}

export const GlobalBankAccountOverviewForm = ({ accountId }: GlobalBankAccountFormProps) => {
    const createAccount = useAdminGlobalBankAccountEndpoints.create();
    const updateAccount = useAdminGlobalBankAccountEndpoints.update();

    const form = useForm({
        schema: globalBankAccountSchemas.updateById.form,

        onSubmit: async (data) => {
            if (accountId) {
                await updateAccount.mutateAsync({
                    param: { id: accountId },
                    json: data,
                });
            }
        },
    });

    return (
        <Form form={form} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        form={form}
                        name="name"
                        label="Name"
                        placeholder="e.g., Checking Account"
                    />

                    <FormSelect
                        form={form}
                        name="type"
                        label="Account Type"
                        placeholder="Select account type"
                        options={[
                            { value: 'checking', label: '💰 Checking Account' },
                            { value: 'savings', label: '🏦 Savings Account' },
                            { value: 'credit_card', label: '💳 Credit Card' },
                            { value: 'investment', label: '📈 Investment Account' },
                        ]}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <FormTextarea
                    form={form}
                    name="description"
                    label="Description"
                    placeholder="Optional description for this account template"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            {/* Status */}
            <div className="space-y-4">
                <FormCheckbox
                    form={form}
                    name="isActive"
                    label="Active Template"
                    description="Enable this account template for user connections"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                >
                    Cancel
                </Button>
                <FormSubmitButton form={form} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {accountId ? 'Update' : 'Create'}
                </FormSubmitButton>
            </div>
        </Form>
    );
};
