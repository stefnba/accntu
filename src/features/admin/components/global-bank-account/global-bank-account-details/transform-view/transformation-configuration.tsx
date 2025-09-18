'use client';

import { useForm } from '@/components/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { transformConfigSchema } from '@/features/bank/schemas';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface TransformationConfigurationProps {
    accountId: string;
}

export const TransformationConfiguration: React.FC<TransformationConfigurationProps> = ({
    accountId,
}) => {
    const { data: account } = useAdminGlobalBankAccountEndpoints.getById({
        param: { id: accountId },
    });

    const updateAccount = useAdminGlobalBankAccountEndpoints.update();

    const { form, Form, Input, Select, SubmitButton } = useForm({
        schema: transformConfigSchema,
        defaultValues: {
            type: 'csv',
            skipRows: 1,
            encoding: 'utf-8',
            sheetName: 'Sheet1',
            delimiter: ',',
            idColumns: [''],
        },
        initialData: account?.transformConfig,
        onSubmit: (data) => {
            updateAccount.mutate(
                {
                    param: { id: accountId },
                    json: {
                        transformConfig: data,
                    },
                },
                {
                    onSuccess: () => {
                        toast.success('Configuration updated successfully');
                    },
                    onError: ({ error }) => {
                        toast.error(error.message);
                    },
                }
            );
        },
    });

    const transformType = form.watch('type');
    const delimiterValue = form.watch('delimiter');

    // Simple direct fix for delimiter when data loads
    useEffect(() => {
        if (
            account?.transformConfig?.delimiter &&
            delimiterValue !== account.transformConfig.delimiter
        ) {
            form.setValue('delimiter', account.transformConfig.delimiter, {
                shouldValidate: false,
            });
        }
    }, [account?.transformConfig?.delimiter, delimiterValue, form.setValue]);

    // Don't render until account data is loaded
    if (!account) {
        return (
            <Card className="min-w-80 md:w-1/3">
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>Loading...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="min-w-80 md:w-1/3">
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
                <Form>
                    <div className="grid grid-cols-1 space-y-4">
                        <Select
                            className="w-full"
                            placeholder="Select transform type"
                            name="type"
                            options={[
                                {
                                    label: 'CSV',
                                    value: 'csv',
                                },
                                {
                                    label: 'Excel',
                                    value: 'excel',
                                },
                                {
                                    label: 'JSON',
                                    value: 'json',
                                },
                            ]}
                            label="Data Source"
                        />

                        {transformType === 'excel' && (
                            <Input placeholder="Sheet Name" name="sheetName" label="Sheet Name" />
                        )}

                        {/* CSV */}
                        {transformType === 'csv' && (
                            <>
                                <Select
                                    name="delimiter"
                                    label="Delimiter"
                                    placeholder="Select delimiter"
                                    options={[
                                        {
                                            label: 'Comma',
                                            value: ',',
                                        },
                                        {
                                            label: 'Semicolon',
                                            value: ';',
                                        },
                                        {
                                            label: 'Tab',
                                            value: '\t',
                                        },
                                    ]}
                                />

                                <Input name="skipRows" label="Skip Rows" />
                                <Select
                                    name="encoding"
                                    label="Encoding"
                                    options={[
                                        {
                                            label: 'UTF-8',
                                            value: 'utf-8',
                                        },
                                    ]}
                                />
                            </>
                        )}

                        <Input name="idColumns" label="ID Columns" />
                        <SubmitButton>Save Config</SubmitButton>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
};
