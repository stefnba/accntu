import { Form, FormSelect, FormSubmitButton, useForm } from '@/components/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserEndpoints } from '@/features/user/api';
import { UpdateUserSchema } from '@/server/db/schemas';

interface AppearanceFormProps {}

export function AppearanceForm({}: AppearanceFormProps) {
    const { mutate: updateUserMutate } = useUserEndpoints.update();

    const appearanceForm = useForm({
        schema: UpdateUserSchema,
        defaultValues: {},
        onSubmit: async (data) => {
            updateUserMutate({
                json: data,
            });
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the appearance of the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form form={appearanceForm}>
                    <div className="grid gap-5">
                        <FormSelect
                            form={appearanceForm}
                            name="settings.theme"
                            label="Theme"
                            description="Select the theme for the dashboard."
                            options={[
                                { label: 'Light', value: 'light' },
                                { label: 'Dark', value: 'dark' },
                                { label: 'System', value: 'system' },
                            ]}
                        />
                    </div>
                    <div className="mt-6">
                        <FormSubmitButton form={appearanceForm}>Update Appearance</FormSubmitButton>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
}
