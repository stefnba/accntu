'use client';

import { Form, FormInput, FormSelect, FormTextarea, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { SqlEditor } from '@/features/admin/components/global-bank-account/global-bank-account-details/sql-editor';
import { globalBankAccountServiceSchemas } from '@/features/bank/schemas';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
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
    const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
    const [showResults, setShowResults] = useState(false);

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
                    setShowResults(true);
                },
                onError: ({ error }) => {
                    toast.error(error.message);
                    setShowResults(false);
                    setSampleData([]);
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
                <div className="space-y-4">
                    {/* Top row with Configuration and SQL Query */}
                    <div className="flex gap-4 md:flex-row flex-col">
                        <Card className="min-w-80 md:w-1/3">
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 space-y-4">
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

                        <Card className="md:w-2/3">
                            <CardHeader>
                                <CardTitle>SQL Query</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* SQL Editor */}
                                <div className="h-[400px]">
                                    <SqlEditor
                                        value={form.watch('transformQuery') ?? ''}
                                        onChange={(value) => form.setValue('transformQuery', value)}
                                    />
                                </div>

                                {/* Test Button */}
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={handleTestQuery}>
                                        {testTransformQuery.isPending && (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        )}
                                        Test Query
                                    </Button>
                                </div>

                                {/* Expandable Results Section */}
                                {sampleData.length > 0 && (
                                    <Collapsible open={showResults} onOpenChange={setShowResults}>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                {showResults ? (
                                                    <ChevronDown className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="mr-2 h-4 w-4" />
                                                )}
                                                View Results ({sampleData.length} rows)
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="mt-4 border rounded-lg">
                                                <div className="p-4 border-b bg-gray-50">
                                                    <h4 className="font-semibold">Query Results</h4>
                                                </div>
                                                <div className="max-h-96 overflow-auto">
                                                    <div className="p-4">
                                                        <pre className="text-sm whitespace-pre-wrap">
                                                            {JSON.stringify(sampleData, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom row with Sample Transform Data - Collapsible */}
                    <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
                        <Card>
                            <CardHeader>
                                <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between w-full cursor-pointer">
                                        <CardTitle className="flex items-center gap-2">
                                            {isCollapsibleOpen ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                            Sample Transform Data
                                        </CardTitle>
                                        <Button variant="ghost" size="sm">
                                            {isCollapsibleOpen ? 'Collapse' : 'Expand'}
                                        </Button>
                                    </div>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent>
                                    <FormTextarea
                                        form={form}
                                        name="sampleTransformData"
                                        className="h-[300px] w-full"
                                        placeholder="Paste your sample data here..."
                                    />
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </div>
            </Form>
        </div>
    );
};
