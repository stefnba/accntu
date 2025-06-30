'use client';

import { Form, FormInput, FormSelect, FormTextarea, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { SqlEditor } from '@/features/admin/components/global-bank-account/global-bank-account-details/sql-editor';
import { globalBankAccountServiceSchemas } from '@/features/bank/schemas';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface GlobalBankAccountDetailsTransformationProps {
    accountId: string;
    bankId: string;
}

export const GlobalBankAccountDetailsTransformation: React.FC<
    GlobalBankAccountDetailsTransformationProps
> = ({ accountId, bankId }) => {
    const [sampleData, setSampleData] = useState<any[]>([]);

    const { data: account } = useAdminGlobalBankAccountEndpoints.getById({
        param: { id: accountId },
    });

    const updateAccount = useAdminGlobalBankAccountEndpoints.update();
    const testTransformQuery = useAdminGlobalBankAccountEndpoints.testTransformQuery();

    useEffect(() => {
        if (account) {
            form.reset({
                transformQuery: account.transformQuery,
                sampleTransformData: account.sampleTransformData,
                transformConfig: account.transformConfig,
            });
        }
    }, [account]);

    const form = useForm({
        schema: globalBankAccountServiceSchemas.update.pick({
            sampleTransformData: true,
            transformQuery: true,
            transformConfig: true,
        }),
        defaultValues: {
            transformQuery: account?.transformQuery ?? '',
            sampleTransformData: account?.sampleTransformData ?? '',
            transformConfig: account?.transformConfig ?? {
                type: 'csv',
                skipRows: 1,
                encoding: 'utf-8',
                sheetName: 'Sheet1',
                delimiter: ',',
            },
        },
        onSubmit: (data) => {
            updateAccount.mutate(
                {
                    param: { id: accountId },
                    json: data,
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

    if (!account) {
        return <div>Account not found</div>;
    }

    const handleTestQuery = () => {
        const transformQuery = form.getValues('transformQuery');
        const sampleTransformData = form.getValues('sampleTransformData');
        const transformConfig = form.getValues('transformConfig');

        if (!transformQuery || !sampleTransformData || !transformConfig) {
            toast.error('Please enter a valid SQL query and sample transform data');
            return;
        }

        testTransformQuery.mutate(
            {
                json: {
                    transformQuery,
                    sampleTransformData,
                    transformConfig,
                },
            },
            {
                onSuccess: (data) => {
                    setSampleData(data.result.data);
                },
            }
        );
    };

    const handleSave = () => {
        form.handleSubmit();
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="text-2xl font-semibold mb-4">Transformation Configuration</div>
                <div className="flex justify-end gap-2 mb-2">
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
            <Form form={form}>
                <div className="flex gap-2 md:flex-row flex-col">
                    <Card
                        className="min-w-60
                    "
                    >
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 space-y-4 space-x-4">
                                <FormSelect
                                    className="w-full"
                                    form={form}
                                    placeholder="Select transform type"
                                    name="transformConfig.type"
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

                                {form.watch('transformConfig.type') === 'excel' && (
                                    <FormInput
                                        form={form}
                                        placeholder="Sheet Name"
                                        name="transformConfig.sheetName"
                                        label="Sheet Name"
                                    />
                                )}

                                {/* CSV */}
                                {form.watch('transformConfig.type') === 'csv' && (
                                    <>
                                        <FormSelect
                                            form={form}
                                            name="transformConfig.delimiter"
                                            label="Delimiter"
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

                                        <FormInput
                                            form={form}
                                            name="transformConfig.skipRows"
                                            label="Skip Rows"
                                        />
                                        <FormSelect
                                            form={form}
                                            name="transformConfig.encoding"
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

                                <FormInput
                                    form={form}
                                    name="transformConfig.idColumns"
                                    label="ID Columns"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-[900px] w-full">
                        <CardHeader>
                            <CardTitle>SQL Query</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[900px]">
                            <SqlEditor
                                value={form.watch('transformQuery') ?? ''}
                                onChange={(value) => form.setValue('transformQuery', value)}
                            />
                            <div className="flex justify-end">
                                <Button variant="outline" onClick={handleTestQuery}>
                                    Test
                                </Button>
                            </div>
                            <div>
                                {testTransformQuery.isPending ? (
                                    <div>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                ) : sampleData.length > 0 ? (
                                    <div>
                                        <h3>Sample Data</h3>
                                        <pre>{JSON.stringify(sampleData, null, 2)}</pre>
                                    </div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="h-[900px] flex-1 w-full md:w-1/2 lg:w-1/3 ">
                        <CardHeader>
                            <CardTitle>Sample Transform Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormTextarea
                                form={form}
                                name="sampleTransformData"
                                className="h-[300px] mt-4"
                            />
                        </CardContent>
                    </Card>
                </div>
            </Form>
        </div>
    );
};
