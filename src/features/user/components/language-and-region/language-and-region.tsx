'use client';

import { SettingsCard } from '@/components/content';
import { Form, FormSelect, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';

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
                <SettingsCard.Auto
                    title="Language"
                    description="Choose your preferred language"
                    items={[
                        {
                            icon: Languages,
                            label: 'Language',
                            description: 'Choose your preferred language',
                            action: (
                                <FormSelect
                                    form={form}
                                    name="language"
                                    placeholder="Select language"
                                    options={languageOptions}
                                />
                            ),
                        },
                    ]}
                />

                {/* Region Card */}
                <SettingsCard.Auto
                    title="Region"
                    description="Set your timezone and regional preferences"
                    items={[
                        {
                            icon: Clock,
                            label: 'Timezone',
                            description: 'Select your timezone for accurate time display',
                            action: (
                                <FormSelect
                                    form={form}
                                    name="timezone"
                                    placeholder="Select timezone"
                                    options={timezoneOptions}
                                />
                            ),
                        },
                        {
                            icon: Calendar,
                            label: 'Date Format',
                            description: 'Choose how dates are displayed',
                            action: (
                                <FormSelect
                                    form={form}
                                    name="dateFormat"
                                    placeholder="Select date format"
                                    options={dateFormatOptions}
                                />
                            ),
                        },
                        {
                            icon: Clock,
                            label: 'Time Format',
                            description: 'Choose 12-hour or 24-hour time format',
                            action: (
                                <FormSelect
                                    form={form}
                                    name="timeFormat"
                                    placeholder="Select time format"
                                    options={timeFormatOptions}
                                />
                            ),
                        },
                    ]}
                />

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
