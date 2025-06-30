'use client';

import { Form, FormSubmitButton, useForm } from '@/components/form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUserEndpoints } from '@/features/user/api';
import { UpdateUserSchema } from '@/server/db/schemas';

interface AppearanceFormProps {}

export function AppearanceForm({}: AppearanceFormProps) {
    const { mutate: updateUserMutate } = useUserEndpoints.update();

    const appearanceForm = useForm({
        schema: UpdateUserSchema.pick({
            settings: true,
        }),
        defaultValues: {
            settings: {
                theme: 'system',
            },
        },
        onSubmit: async (data) => {
            updateUserMutate({
                json: data,
            });
        },
    });

    return (
        <Form form={appearanceForm}>
            <FormField
                control={appearanceForm.control}
                name="settings.theme"
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <FormMessage />
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid max-w-xl grid-cols-3 gap-10 pt-4"
                        >
                            <FormItem>
                                <FormLabel className="[&:has([data-state=checked])>div>div]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="system"
                                            className="sr-only cursor-pointer"
                                        />
                                    </FormControl>
                                    <div className="flex flex-col">
                                        <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer ">
                                            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 text-center font-normal">System</div>
                                    </div>
                                </FormLabel>
                            </FormItem>
                            <FormItem>
                                <FormLabel className="[&:has([data-state=checked])>div>div]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="light"
                                            className="sr-only cursor-pointer"
                                        />
                                    </FormControl>
                                    <div className="flex flex-col">
                                        <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer ">
                                            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 text-center font-normal">Light</div>
                                    </div>
                                </FormLabel>
                            </FormItem>
                            <FormItem>
                                <FormLabel className="[&:has([data-state=checked])>div>div]:border-primary cursor-pointer">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="dark"
                                            className="sr-only cursor-pointer"
                                        />
                                    </FormControl>
                                    <div className="flex flex-col">
                                        <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="block w-full p-2 text-center font-normal">
                                            Dark
                                        </span>
                                    </div>
                                </FormLabel>
                            </FormItem>
                        </RadioGroup>
                    </FormItem>
                )}
            />

            <FormSubmitButton className="mt-6" form={appearanceForm}>
                Update Theme
            </FormSubmitButton>
        </Form>
    );
}
