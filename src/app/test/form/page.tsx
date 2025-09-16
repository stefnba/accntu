'use client';

import { useForm } from '@/components/form/hooks';
import { z } from 'zod';

export default function TestNewForm() {
    const { Form, Input, Textarea, SubmitButton } = useForm({
        schema: z.object({
            name: z.string().min(1),
            age: z.coerce.number(),
            location: z.string().min(1),
            description: z.string().min(1),
        }),
        defaultValues: {
            name: '',
            age: 0,
            location: '',
            description: '',
        },
        onSubmit: async (data) => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            alert('Submit: ' + JSON.stringify(data));
        },
        onError: (errors) => {
            alert('Error: ' + JSON.stringify(errors));
        },
        disableOnSubmit: true,
    });

    // const values = useMemo(() => form.watch(), [form.watch]);

    return (
        <div>
            <Form>
                <Input label="Name" name="name" />
                <Input disabled={false} label="Location" name="location" />
                <Input label="Age" name="age" />
                <Textarea label="Description" name="description" />
                <SubmitButton>Submit</SubmitButton>
            </Form>
            {/* <pre className="text-xs mt-4">{JSON.stringify(values, null, 2)}</pre> */}
        </div>
    );
}
