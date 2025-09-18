'use client';

import { useForm, useUpsertForm } from '@/components/form/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { z } from 'zod';

const TestSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email'),
    age: z.number().min(18, 'Must be 18 or older'),
});

const UpsertCreateSchema = z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    what: z.string().min(1),
    description: z.string().min(1),
});

const UpsertUpdateSchema = z.object({
    name: z.string().min(1),
    age: z.coerce.number(),
    location: z.string().min(1),
    description: z.string().min(1),
});

type TestData = z.infer<typeof TestSchema>;

const mockApiData: TestData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
};

export default function FormTestingPage() {
    const [apiData, setApiData] = useState<TestData | undefined>(undefined);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [upsertMode, setUpsertMode] = useState<'create' | 'update'>('create');

    // Simulate API call
    const loadData = async () => {
        setIsLoadingData(true);
        setApiData(undefined);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setApiData(mockApiData);
        setIsLoadingData(false);
    };

    // Basic Form
    const basicForm = useForm({
        schema: TestSchema,
        defaultValues: {
            name: '',
            email: '',
            age: 18,
        },
        onSubmit: async (data) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log('Basic form submitted:', data);
        },
        onError: (errors) => {
            console.log('Basic form errors:', errors);
        },
        disableOnSubmit: true,
    });

    // Dynamic Form with API data
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

    // Form with requireChanges option
    const requireChangesForm = useForm({
        schema: TestSchema,
        defaultValues: {
            name: '',
            email: '',
            age: 18,
        },
        initialData: apiData,
        requireChanges: true,
        onSubmit: async (data) => {
            console.log('RequireChanges form submitted:', data);
        },
    });

    // Server Error Form
    const serverErrorForm = useForm({
        schema: TestSchema,
        defaultValues: {
            name: '',
            email: '',
            age: 18,
        },
        onSubmit: async (data) => {
            console.log('Server error form submitted:', data);

            // Simulate server business logic error
            if (data.email === 'error@test.com') {
                serverErrorForm.setServerError('This email is already taken');
                return; // Don't throw, just set server error and return
            }

            if (data.name === 'forbidden') {
                serverErrorForm.setServerError('Name contains forbidden word');
                return; // Don't throw, just set server error and return
            }

            // Success case
            console.log('Server error form submitted successfully:', data);
        },
    });

    // Upsert Form
    const upsertForm = useUpsertForm({
        create: {
            schema: UpsertCreateSchema,
            defaultValues: {
                name: '',
                location: '',
                what: '',
                description: '',
            },
            onSubmit: (data) => {
                console.log('Create form submitted:', data);
            },
        },
        update: {
            schema: UpsertUpdateSchema,
            defaultValues: {
                name: '',
                age: 0,
                location: '',
                description: '',
            },
            onSubmit: (data) => {
                console.log('Update form submitted:', data);
            },
        },
        mode: upsertMode,
    });

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Form Testing Suite</h1>
                <p className="text-lg text-muted-foreground">
                    Comprehensive testing for all form features and use cases
                </p>

                {/* Global Controls */}
                <div className="space-x-4">
                    <Button onClick={loadData} disabled={isLoadingData}>
                        {isLoadingData ? 'Loading...' : 'Load API Data'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setApiData(undefined);
                            setIsLoadingData(false);
                            // Reset all forms
                            explicitLoadingForm.form.reset({ name: '', email: '', age: 18 });
                            dynamicForm.form.reset({ name: '', email: '', age: 18 });
                            requireChangesForm.form.reset({ name: '', email: '', age: 18 });
                            serverErrorForm.reset({ name: '', email: '', age: 18 });
                            serverErrorForm.clearServerError();
                            basicForm.form.reset({ name: '', email: '', age: 18 });
                        }}
                    >
                        Reset All Forms
                    </Button>
                </div>

                <div className="inline-flex items-center gap-4 px-4 py-2 bg-muted rounded-lg">
                    <span className="text-sm font-medium">API Data Status:</span>
                    <span className={`text-sm ${apiData ? 'text-green-600' : 'text-red-600'}`}>
                        {apiData ? '✅ Loaded' : '❌ Not Loaded'}
                    </span>
                    <span className="text-sm text-muted-foreground">|</span>
                    <span className="text-sm">
                        Loading: {isLoadingData ? '⏳ Yes' : '✅ No'}
                    </span>
                </div>
            </div>

            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
                    <TabsTrigger value="loading">Loading</TabsTrigger>
                    <TabsTrigger value="changes">Changes</TabsTrigger>
                    <TabsTrigger value="errors">Errors</TabsTrigger>
                    <TabsTrigger value="upsert">Upsert</TabsTrigger>
                </TabsList>

                {/* Basic Form */}
                <TabsContent value="basic">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Form</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Standard form with static default values and submission handling
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <basicForm.Form>
                                <basicForm.Input name="name" placeholder="Name" />
                                <basicForm.Input name="email" type="email" placeholder="Email" />
                                <basicForm.Input name="age" type="number" placeholder="Age" />
                                <basicForm.SubmitButton>Submit Basic Form</basicForm.SubmitButton>
                            </basicForm.Form>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Loading: {basicForm.form.isLoading ? 'Yes' : 'No'}</div>
                                <div>Submitting: {basicForm.form.isSubmitting ? 'Yes' : 'No'}</div>
                                <div>Valid: {basicForm.form.formState.isValid ? 'Yes' : 'No'}</div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Form Values:</h4>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(basicForm.form.getValues(), null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Dynamic Form */}
                <TabsContent value="dynamic">
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
                                <dynamicForm.SubmitButton>Submit Dynamic Form</dynamicForm.SubmitButton>
                            </dynamicForm.Form>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Loading: {dynamicForm.form.isLoading ? 'Yes' : 'No'}</div>
                                <div>Submitting: {dynamicForm.form.isSubmitting ? 'Yes' : 'No'}</div>
                                <div>Valid: {dynamicForm.form.formState.isValid ? 'Yes' : 'No'}</div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Form Values:</h4>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(dynamicForm.form.getValues(), null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Explicit Loading Form */}
                <TabsContent value="loading">
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
                                <explicitLoadingForm.Input name="email" type="email" placeholder="Email" />
                                <explicitLoadingForm.Input name="age" type="number" placeholder="Age" />
                                <explicitLoadingForm.SubmitButton>Submit Loading Form</explicitLoadingForm.SubmitButton>
                            </explicitLoadingForm.Form>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Loading: {explicitLoadingForm.form.isLoading ? 'Yes' : 'No'}</div>
                                <div>Submitting: {explicitLoadingForm.form.isSubmitting ? 'Yes' : 'No'}</div>
                                <div>Valid: {explicitLoadingForm.form.formState.isValid ? 'Yes' : 'No'}</div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Form Values:</h4>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(explicitLoadingForm.form.getValues(), null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RequireChanges Form */}
                <TabsContent value="changes">
                    <Card>
                        <CardHeader>
                            <CardTitle>RequireChanges Form</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Form with requireChanges=true (only valid after changes)
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <requireChangesForm.Form>
                                <requireChangesForm.Input name="name" placeholder="Name" />
                                <requireChangesForm.Input name="email" type="email" placeholder="Email" />
                                <requireChangesForm.Input name="age" type="number" placeholder="Age" />
                                <requireChangesForm.SubmitButton>Submit Changes</requireChangesForm.SubmitButton>
                            </requireChangesForm.Form>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Loading: {requireChangesForm.form.isLoading ? 'Yes' : 'No'}</div>
                                <div>Submitting: {requireChangesForm.form.isSubmitting ? 'Yes' : 'No'}</div>
                                <div>HasChanges: {requireChangesForm.form.hasChanges ? 'Yes' : 'No'}</div>
                                <div>Valid: {requireChangesForm.form.formState.isValid ? 'Yes' : 'No'}</div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Form Values:</h4>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(requireChangesForm.form.getValues(), null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Server Error Form */}
                <TabsContent value="errors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Server Error & External Control</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Form with server error handling and external control testing
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <serverErrorForm.Form>
                                <serverErrorForm.Input name="name" placeholder="Name (try 'forbidden')" />
                                <serverErrorForm.Input
                                    name="email"
                                    type="email"
                                    placeholder="Email (try 'error@test.com')"
                                />
                                <serverErrorForm.Input name="age" type="number" placeholder="Age" />
                                <serverErrorForm.SubmitButton>Test Server Error</serverErrorForm.SubmitButton>
                            </serverErrorForm.Form>

                            {/* Server Error Display */}
                            {serverErrorForm.form.serverError && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm text-destructive">{serverErrorForm.form.serverError}</p>
                                </div>
                            )}

                            {/* External Control Buttons */}
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => serverErrorForm.setValue('name', 'Preset Name')}
                                    >
                                        Set Name
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => serverErrorForm.trigger()}
                                    >
                                        Trigger Validation
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => serverErrorForm.clearErrors()}
                                    >
                                        Clear Errors
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => serverErrorForm.setServerError('Test server error message')}
                                    className="w-full"
                                >
                                    Set Test Server Error
                                </Button>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Loading: {serverErrorForm.form.isLoading ? 'Yes' : 'No'}</div>
                                <div>Submitting: {serverErrorForm.form.isSubmitting ? 'Yes' : 'No'}</div>
                                <div>HasServerError: {serverErrorForm.form.serverError ? 'Yes' : 'No'}</div>
                                <div>Valid: {serverErrorForm.form.formState.isValid ? 'Yes' : 'No'}</div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Form Values & State:</h4>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(
                                        {
                                            values: serverErrorForm.form.getValues(),
                                            serverError: serverErrorForm.form.serverError,
                                            errors: serverErrorForm.form.formState.errors,
                                        },
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Upsert Form */}
                <TabsContent value="upsert">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upsert Form</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Form with create/update mode switching and different schemas
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Mode Toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Mode:</span>
                                <Button
                                    variant={upsertMode === 'create' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setUpsertMode('create')}
                                >
                                    Create
                                </Button>
                                <Button
                                    variant={upsertMode === 'update' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setUpsertMode('update')}
                                >
                                    Update
                                </Button>
                                <span className="text-lg font-bold text-primary ml-2">
                                    {upsertMode.toUpperCase()}
                                </span>
                            </div>

                            <upsertForm.Form className="space-y-4">
                                <upsertForm.Input name="name" placeholder="Name" />
                                <upsertForm.Input mode="update" name="age" placeholder="Age (update only)" />
                                <upsertForm.Input name="location" placeholder="Location" />
                                <upsertForm.Input mode="create" name="what" placeholder="What (create only)" />
                                <upsertForm.Textarea name="description" placeholder="Description" />
                                <upsertForm.SubmitButton>
                                    Submit {upsertMode === 'create' ? 'Create' : 'Update'}
                                </upsertForm.SubmitButton>
                            </upsertForm.Form>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Mode: {upsertForm.upsert.mode}</div>
                                <div>IsCreate: {upsertForm.upsert.isCreate ? 'Yes' : 'No'}</div>
                                <div>IsUpdate: {upsertForm.upsert.isUpdate ? 'Yes' : 'No'}</div>
                                <div>Valid: {upsertForm.form.formState.isValid ? 'Yes' : 'No'}</div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Form Values:</h4>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(upsertForm.form.getValues(), null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}