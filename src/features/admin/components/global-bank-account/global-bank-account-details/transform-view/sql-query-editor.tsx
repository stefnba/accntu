'use client';

import { Form, FormSubmitButton, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { SqlEditor } from '@/features/admin/components/global-bank-account/global-bank-account-details/transform-view/sql-editor';
import { globalBankAccountServiceSchemas } from '@/features/bank/schemas';
import { ChevronDown, ChevronRight, Code2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'sql-formatter';

interface SqlQueryEditorProps {
    accountId: string;
}

export const SqlQueryEditor: React.FC<SqlQueryEditorProps> = ({ accountId }) => {
    const { data: account } = useAdminGlobalBankAccountEndpoints.getById({
        param: { id: accountId },
    });

    const [showResults, setShowResults] = useState(false);
    const [sampleData, setSampleData] = useState<any[]>([]);

    const updateAccount = useAdminGlobalBankAccountEndpoints.update();
    const testTransformQuery = useAdminGlobalBankAccountEndpoints.testTransformQuery();

    const form = useForm({
        schema: globalBankAccountServiceSchemas.update.pick({
            transformQuery: true,
        }),
        defaultValues: {
            transformQuery: '',
        },
        onSubmit: (data) => {
            updateAccount.mutate(
                {
                    param: { id: accountId },
                    json: data,
                },
                {
                    onSuccess: () => {
                        toast.success('SQL Query updated successfully');
                    },
                    onError: ({ error }) => {
                        toast.error(error.message);
                    },
                }
            );
        },
    });

    useEffect(() => {
        if (account?.transformQuery) {
            form.reset({
                transformQuery: account.transformQuery,
            });
        }
    }, [account?.transformQuery, form.reset]);

    // Auto-expand results when new data comes in
    useEffect(() => {
        if (sampleData.length > 0) {
            setShowResults(true);
        }
    }, [sampleData]);

    const transformQuery = form.watch('transformQuery');

    console.log(form.formState);

    const handleFormatSql = () => {
        try {
            const formatted = format(transformQuery ?? '', {
                language: 'duckdb',
                keywordCase: 'upper',
                indentStyle: 'standard',
                tabWidth: 4,
            });
            form.setValue('transformQuery', formatted);
            toast.success('SQL formatted successfully');
        } catch (error) {
            console.log(error);
            toast.error('Failed to format SQL: Invalid syntax');
        }
    };

    const handleTestQuery = () => {
        const transformQuery = form.getValues('transformQuery');
        const sampleTransformData = account?.sampleTransformData;
        const transformConfig = account?.transformConfig;

        if (!transformQuery || !sampleTransformData || !transformConfig) {
            toast.error('Please ensure SQL query, sample data, and configuration are all set');
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
                onError: ({ error }) => {
                    toast.error(error.message);
                    setSampleData([]);
                },
            }
        );
    };

    return (
        <Card className="md:w-2/3">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>SQL Query</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleFormatSql}>
                            <Code2 className="w-4 h-4 mr-2" />
                            Format SQL
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form form={form}>
                    {/* SQL Editor */}
                    <div className="h-[400px]">
                        <SqlEditor
                            value={transformQuery ?? ''}
                            onChange={(value) => form.setValue('transformQuery', value)}
                        />
                    </div>

                    {/* Test Button */}
                    <div className="flex justify-end my-4 gap-2">
                        <Button
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                handleTestQuery();
                            }}
                            disabled={testTransformQuery.isPending}
                        >
                            {testTransformQuery.isPending && (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            )}
                            Test Query
                        </Button>

                        <FormSubmitButton form={form}>Save Query</FormSubmitButton>
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
                </Form>
            </CardContent>
        </Card>
    );
};
