'use client';

import { userActions } from '@/actions';
import { UpdateUserSchema } from '@/actions/user/update';
import { Form, FormRadio, FormSubmit, useForm } from '@/components/form';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { RadioGroup } from '@/components/ui/radio-group';
import { useMutation } from '@/hooks/mutation';
import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { useTheme } from 'next-themes';

export const ThemeForm = () => {
    const form = useForm(UpdateUserSchema, {
        defaultValues: {
            theme: 'LIGHT'
        }
    });

    const { setTheme } = useTheme();

    const { execute } = useMutation(userActions.update, {
        onComplete() {
            console.log('Theme updated');
            const selectedTheme = form.getValues('theme')?.toLowerCase();

            if (selectedTheme === 'light') {
                setTheme('light');
            }
            if (selectedTheme === 'dark') {
                setTheme('dark');
            }
        }
        // onSuccess(data) {
        //     console.log(data);
        // }
    });

    return (
        <Form form={form} onSubmit={execute}>
            <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <FormLabel className="text-lg">Theme</FormLabel>
                        <FormDescription className="text-base">
                            Select the theme for the dashboard.
                        </FormDescription>
                        <FormMessage />
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid max-w-md grid-cols-2 gap-8 pt-4"
                        >
                            <FormItem>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="LIGHT"
                                            className="sr-only cursor-pointer"
                                        />
                                    </FormControl>
                                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer">
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
                                    <span className="block w-full p-2 text-center font-normal">
                                        Light
                                    </span>
                                </FormLabel>
                            </FormItem>
                            <FormItem>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="DARK"
                                            className="sr-only cursor-pointer"
                                        />
                                    </FormControl>
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
                                </FormLabel>
                            </FormItem>
                        </RadioGroup>
                    </FormItem>
                )}
            />

            <FormSubmit className="mt-6" form={form} title="Update theme" />
        </Form>
    );
};
