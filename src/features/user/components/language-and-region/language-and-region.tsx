'use client';

import { Form, FormSelect, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Calendar, Clock, Languages } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';

const languageAndRegionSchema = z.object({
    language: z.string(),
    timezone: z.string(),
    dateFormat: z.string(),
    timeFormat: z.string(),
});

export const LanguageAndRegionForm = () => {
    const form = useForm({
        schema: languageAndRegionSchema,
        defaultValues: {
            language: 'en',
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
        },
        onSubmit: async (data) => {
            console.log(data);
            toast.success('General settings updated');
        },
    });

    const languageOptions = [
        { value: 'en', label: 'English' },
        // { value: 'es', label: 'Español' },
        // { value: 'fr', label: 'Français' },
        // { value: 'de', label: 'Deutsch' },
        // { value: 'it', label: 'Italiano' },
        // { value: 'pt', label: 'Português' },
        // { value: 'ja', label: '日本語' },
        // { value: 'ko', label: '한국어' },
        // { value: 'zh', label: '中文' },
    ];

    const timezoneOptions = [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Europe/Berlin', label: 'Berlin (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
        { value: 'Asia/Dubai', label: 'Dubai (GST)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
    ];

    const dateFormatOptions = [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2023)' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2023)' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2023-12-31)' },
        { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2023)' },
        { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2023)' },
    ];

    const timeFormatOptions = [
        { value: '12h', label: '12-hour (12:00 PM)' },
        { value: '24h', label: '24-hour (12:00)' },
    ];

    return (
        <div className="space-y-6">
            <Form form={form} className="space-y-6">
                {/* Language Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">Language</CardTitle>
                        <CardDescription>Choose your preferred language</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-3">
                                <Languages className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">Language</div>
                                    <div className="text-sm text-muted-foreground">
                                        Choose your preferred language
                                    </div>
                                </div>
                            </div>

                            <FormSelect
                                form={form}
                                name="language"
                                placeholder="Select language"
                                options={languageOptions}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Region Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">Region</CardTitle>
                        <CardDescription>
                            Set your timezone and regional preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">Timezone</div>
                                    <div className="text-sm text-muted-foreground">
                                        Select your timezone for accurate time display
                                    </div>
                                </div>
                            </div>

                            <FormSelect
                                form={form}
                                name="timezone"
                                placeholder="Select timezone"
                                options={timezoneOptions}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">Date Format</div>
                                    <div className="text-sm text-muted-foreground">
                                        Choose how dates are displayed
                                    </div>
                                </div>
                            </div>

                            <FormSelect
                                form={form}
                                name="dateFormat"
                                placeholder="Select date format"
                                options={dateFormatOptions}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <div className="font-medium">Time Format</div>
                                    <div className="text-sm text-muted-foreground">
                                        Choose 12-hour or 24-hour time format
                                    </div>
                                </div>
                            </div>

                            <FormSelect
                                form={form}
                                name="timeFormat"
                                placeholder="Select time format"
                                options={timeFormatOptions}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Form>
        </div>
    );
};
