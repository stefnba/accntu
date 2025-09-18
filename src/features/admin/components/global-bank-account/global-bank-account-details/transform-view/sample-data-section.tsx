'use client';

import { useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';

interface SampleDataSectionProps {
    accountId: string;
}

export const SampleDataSection: React.FC<SampleDataSectionProps> = ({ accountId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const updateAccount = useAdminGlobalBankAccountEndpoints.update();

    const { data: account } = useAdminGlobalBankAccountEndpoints.getById({
        param: { id: accountId },
    });

    const { Form, Textarea, SubmitButton } = useForm({
        schema: z.object({
            sampleTransformData: z.string(),
        }),
        defaultValues: {
            sampleTransformData: '',
        },
        initialData: {
            sampleTransformData: account?.sampleTransformData,
        },
        onSubmit: (data) => {
            updateAccount.mutate(
                {
                    param: { id: accountId },
                    json: data,
                },
                {
                    onSuccess: () => {
                        toast.success('Sample data updated successfully');
                    },
                    onError: ({ error }) => {
                        toast.error(error.message);
                    },
                }
            );
        },
    });

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer">
                            <CardTitle className="flex items-center gap-2">
                                {isOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                                Sample Transform Data
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                    {isOpen ? 'Collapse' : 'Expand'}
                                </Button>
                            </div>
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        <Form>
                            <Textarea
                                name="sampleTransformData"
                                className="h-[300px] w-full"
                                placeholder="Paste your sample data here..."
                            />
                            <div className="w-full flex justify-end mt-4">
                                <SubmitButton>Save Sample Data</SubmitButton>
                            </div>
                        </Form>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
