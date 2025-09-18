'use client';

import { useUpsertForm } from '@/components/form/hooks';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { z } from 'zod';

export default function TestNewForm2() {
    const [mode, setMode] = useState<'create' | 'update'>('create');

    const { Input, Form, form, SubmitButton } = useUpsertForm({
        create: {
            schema: z.object({
                name: z.string().min(1),
                location: z.string().min(1),
                what: z.string().min(1),
            }),
            defaultValues: {
                name: '',
                location: '',
                what: '',
            },
            onSubmit: (data) => {
                console.log(data);
                alert('create');
            },
        },
        update: {
            defaultValues: {
                name: '',
                age: '',
                location: '',
            },
            onSubmit: (data) => {
                console.log(data);
                alert('update');
            },
            schema: z.object({
                name: z.string().min(1),
                age: z.coerce.number(),
                location: z.string().min(1),
            }),
        },
        mode,
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
            <Form className="mt-4 space-y-4">
                <div className="space-y-2">
                    <Input label="Name" name="name" />
                    <Input label="Age" mode="update" name="age" />
                    <Input label="Location" name="location" />
                    <Input label="What" mode="create" name="what" />
                </div>
                <SubmitButton>Submit</SubmitButton>
            </Form>
        </div>
    );
}
