'use client';

import { useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { QueryResultView } from '@/features/admin/components/global-bank-account/global-bank-account-details/transform-view/query-result-view';
import { SqlEditor } from '@/features/admin/components/global-bank-account/global-bank-account-details/transform-view/sql-editor';
import { globalBankAccountSchemas } from '@/features/bank/schemas';
import { Code2, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'sql-formatter';

interface SqlQueryEditorProps {
    accountId: string;
}

export const SqlQueryEditor: React.FC<SqlQueryEditorProps> = ({ accountId }) => {
    const { data: account } = useAdminGlobalBankAccountEndpoints.getById({
        param: { id: accountId },
    });

    const updateAccount = useAdminGlobalBankAccountEndpoints.update();
    const testTransformQuery = useAdminGlobalBankAccountEndpoints.testTransformQuery();

    const { form, Form, SubmitButton } = useForm({
        schema: globalBankAccountSchemas.testTransform.service.pick({
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

    const transformQuery = form.watch('transformQuery');

    useEffect(() => {
        if (account?.transformQuery) {
            form.reset({
                transformQuery: account.transformQuery,
            });
        }
    }, [account?.transformQuery, form.reset]);

    const handleFormatSql = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
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
                onError: ({ error }) => {
                    toast.error(error.message);
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
                <Form>
                    {/* SQL Editor */}
                    <div className="h-[400px]">
                        <SqlEditor
                            value={transformQuery ?? ''}
                            onChange={(value) => form.setValue('transformQuery', value)}
                        />
                    </div>
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
                        <SubmitButton>Save Query</SubmitButton>
                    </div>

                    <QueryResultView
                        transformResult={testTransformQuery.data?.data?.result.validatedData}
                        isLoading={testTransformQuery.isPending}
                    />
                </Form>
            </CardContent>
        </Card>
    );
};
