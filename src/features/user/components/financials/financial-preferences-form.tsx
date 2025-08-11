'use client';

import { Form, FormSelect, FormSwitch, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Calculator, DollarSign, EyeOff } from 'lucide-react';
import { z } from 'zod';

export const FinancialPreferencesForm = () => {
    const form = useForm({
        schema: z.object({
            defaultCurrency: z.string(),
            hideAmounts: z.boolean(),
            showCents: z.boolean(),
            roundingMode: z.string(),
        }),
        defaultValues: {
            defaultCurrency: 'USD',
            hideAmounts: false,
            showCents: false,
            roundingMode: 'none',
        },
        onSubmit: async (data) => {
            console.log(data);
        },
    });
    const currencyOptions = [
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'GBP', label: 'British Pound (GBP)' },
        { value: 'JPY', label: 'Japanese Yen (JPY)' },
        { value: 'CAD', label: 'Canadian Dollar (CAD)' },
        { value: 'AUD', label: 'Australian Dollar (AUD)' },
        { value: 'CHF', label: 'Swiss Franc (CHF)' },
        { value: 'CNY', label: 'Chinese Yuan (CNY)' },
    ];

    const roundingModeOptions = [
        { value: 'none', label: 'No Rounding', description: 'Show exact amounts' },
        { value: 'nearest', label: 'Round to Nearest', description: 'Round to nearest cent' },
        { value: 'up', label: 'Round Up', description: 'Always round up' },
        { value: 'down', label: 'Round Down', description: 'Always round down' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Preferences
                </CardTitle>
                <CardDescription>
                    Configure how financial data is displayed and calculated
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form form={form} className="space-y-6">
                    <div className="space-y-6">
                        {/* Currency Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">Currency</h3>
                            </div>

                            <FormSelect
                                form={form}
                                name="defaultCurrency"
                                label="Default Currency"
                                placeholder="Select currency"
                                options={currencyOptions}
                            />
                        </div>

                        {/* Display Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">Display Options</h3>
                            </div>

                            <FormSwitch
                                form={form}
                                name="hideAmounts"
                                label="Hide Amounts"
                                description="Hide financial amounts for privacy (show as ****)"
                            />

                            <FormSwitch
                                form={form}
                                name="showCents"
                                label="Show Cents"
                                description="Display cents/decimals in amounts"
                            />
                        </div>

                        {/* Calculation Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">Calculations</h3>
                            </div>

                            <FormSelect
                                form={form}
                                name="roundingMode"
                                label="Rounding Mode"
                                placeholder="Select rounding mode"
                                options={roundingModeOptions.map((option) => ({
                                    value: option.value,
                                    label: (
                                        <div>
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {option.description}
                                            </div>
                                        </div>
                                    ),
                                }))}
                            />
                        </div>

                        {/* Preview */}
                        <div className="rounded-lg border p-4 bg-muted/50">
                            <h4 className="text-sm font-medium mb-2">Preview</h4>
                            <div className="text-sm text-muted-foreground">
                                Sample amount:{' '}
                                <span className="font-mono">
                                    {form.watch('hideAmounts')
                                        ? '****'
                                        : `${form.watch('defaultCurrency')} 1,234${form.watch('showCents') ? '.56' : ''}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
};
