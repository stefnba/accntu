'use client';

import { useForm } from '@/components/form/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { z } from 'zod';

const TestSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email'),
    age: z.number().min(18, 'Must be 18 or older'),
});

type TestData = z.infer<typeof TestSchema>;

const mockApiData: TestData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
};

export default function DynamicFormTestPage() {
    const [apiData, setApiData] = useState<TestData | undefined>(undefined);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Simulate API call
    const loadData = async () => {
        setIsLoadingData(true);
        setApiData(undefined);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setApiData(mockApiData);
        setIsLoadingData(false);
    };

    // Form with static defaults
    const staticForm = useForm({
        schema: TestSchema,
        defaultValues: {
            name: 'Static Default',
            email: 'static@example.com',
            age: 20,
        },
        onSubmit: async (data) => {
            console.log('Static form submitted:', data);
        },
    });

    // Form with dynamic data
    const dynamicForm = useForm({
        schema: TestSchema,
        defaultValues: {
            name: '',
            email: '',
            age: 18,
        },
        initialData: apiData,
        onSubmit: async (data) => {
            console.log('Dynamic form submitted:', data);
        },
    });

    // Form with explicit loading state
    const explicitLoadingForm = useForm({
        schema: TestSchema,
        defaultValues: {
            name: '',
            email: '',
            age: 18,
        },
        initialData: apiData,
        showLoadingState: isLoadingData,
        onSubmit: async (data) => {
            console.log('Explicit loading form submitted:', data);
        },
    });

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">Dynamic Form Test</h1>
                <div className="space-x-4">
                    <Button onClick={loadData} disabled={isLoadingData}>
                        {isLoadingData ? 'Loading...' : 'Load API Data'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setApiData(undefined);
                            setIsLoadingData(false);
                            explicitLoadingForm.form.reset({ name: '', email: '', age: 18 });
                            dynamicForm.form.reset({ name: '', email: '', age: 18 });
                        }}
                    >
                        Clear Data
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    API Data Status: {apiData ? '✅ Loaded' : '❌ Not Loaded'} | Loading:{' '}
                    {isLoadingData ? '⏳ Yes' : '✅ No'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Static Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Static Form</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Regular form with static default values
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <staticForm.Form>
                            <staticForm.Input name="name" placeholder="Name" />
                            <staticForm.Input name="email" type="email" placeholder="Email" />
                            <staticForm.Input name="age" type="number" placeholder="Age" />
                            <staticForm.SubmitButton>Submit Static</staticForm.SubmitButton>
                        </staticForm.Form>
                        <div className="text-xs text-muted-foreground">
                            Loading: {staticForm.form.isLoading ? 'Yes' : 'No'} | Submitting:{' '}
                            {staticForm.form.isSubmitting ? 'Yes' : 'No'}
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dynamic Form</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Form with initialData prop (auto-loading detection)
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <dynamicForm.Form>
                            <dynamicForm.Input name="name" placeholder="Name" />
                            <dynamicForm.Input name="email" type="email" placeholder="Email" />
                            <dynamicForm.Input name="age" type="number" placeholder="Age" />
                            <dynamicForm.SubmitButton>Submit Dynamic</dynamicForm.SubmitButton>
                        </dynamicForm.Form>
                        <div className="text-xs text-muted-foreground">
                            Loading: {dynamicForm.form.isLoading ? 'Yes' : 'No'} | Submitting:{' '}
                            {dynamicForm.form.isSubmitting ? 'Yes' : 'No'}
                        </div>
                    </CardContent>
                </Card>

                {/* Explicit Loading Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Explicit Loading Form</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Form with explicit showLoadingState control
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <explicitLoadingForm.Form>
                            <explicitLoadingForm.Input name="name" placeholder="Name" />
                            <explicitLoadingForm.Input
                                name="email"
                                type="email"
                                placeholder="Email"
                            />
                            <explicitLoadingForm.Input name="age" type="number" placeholder="Age" />
                            <explicitLoadingForm.SubmitButton>
                                Submit Explicit
                            </explicitLoadingForm.SubmitButton>
                        </explicitLoadingForm.Form>
                        <div className="text-xs text-muted-foreground">
                            Loading: {explicitLoadingForm.form.isLoading ? 'Yes' : 'No'} |
                            Submitting: {explicitLoadingForm.form.isSubmitting ? 'Yes' : 'No'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Debug Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Debug Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-2">Static Form Values:</h4>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(staticForm.form.getValues(), null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Dynamic Form Values:</h4>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(dynamicForm.form.getValues(), null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">API Data:</h4>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(apiData || 'undefined', null, 2)}
                            </pre>
                            <h4 className="font-semibold mb-2">Explicit Loading Form Values:</h4>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(explicitLoadingForm.form.getValues(), null, 2)}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
