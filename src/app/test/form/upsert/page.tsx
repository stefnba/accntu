'use client';

import { useUpsertForm } from '@/components/form/hooks';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { z } from 'zod';

export default function TestNewForm2() {
    const [mode, setMode] = useState<'create' | 'update'>('create');

    const { form, Form, Input, SubmitButton } = useUpsertForm({
        create: {
            schema: z.object({
                name: z.string(),
            }),
            defaultValues: {
                name: '',
            },
            onSubmit: (data) => {
                alert('Submit');
            },
            onError: (errors) => {
                alert('Error');
            },
        },
        update: {
            schema: z.object({
                name: z.string(),
                age: z.string(),
            }),
            defaultValues: {
                name: '',
                age: '',
            },
            onSubmit: (data) => {
                alert('Submit');
            },
            onError: (errors) => {
                alert('Error');
            },
        },
        mode: mode,
    });

    return (
        <div>
            <div className="text-lg font-bold mb-4">{mode.toLocaleUpperCase()}</div>
            <div className="flex items-center gap-2">
                <Button disabled={mode === 'create'} onClick={() => setMode('create')}>
                    Create
                </Button>
                <Button disabled={mode === 'update'} onClick={() => setMode('update')}>
                    Update
                </Button>
            </div>
            <Form className="mt-4space-y-4">
                <div className="flex gap-2">
                    <Input label="Name" name="name" />
                    {mode === 'update' && <Input label="Age" name="name" />}
                </div>
                <SubmitButton>Submit</SubmitButton>
            </Form>

            {/* <pre>{JSON.stringify(form, null, 2)}</pre> */}
        </div>
    );
}
