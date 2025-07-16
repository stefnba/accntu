'use client';

import { Form, FormSwitch, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Bell, Calendar, FileText, Mail, Megaphone, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';

const notificationSchema = z.object({
    email: z.boolean(),
    push: z.boolean(),
    marketing: z.boolean(),
    transactionAlerts: z.boolean(),
    weeklyReports: z.boolean(),
    monthlyReports: z.boolean(),
});

export const NotificationPreferencesForm = () => {
    const form = useForm({
        schema: notificationSchema,
        defaultValues: {
            email: true,
            push: false,
            marketing: false,
            transactionAlerts: true,
            weeklyReports: true,
            monthlyReports: false,
        },
        onSubmit: async (data) => {
            console.log(data);
            toast.success('Notification preferences updated');
        },
    });

    return (
        <div className="space-y-6">
            <Form form={form} className="space-y-6">
                {/* Communication Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">Communication</CardTitle>
                        <CardDescription>How you receive updates and messages</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <FormSwitch
                                    form={form}
                                    name="email"
                                    label="Email Notifications"
                                    description="Receive notifications via email"
                                />
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <FormSwitch
                                    form={form}
                                    name="push"
                                    label="Push Notifications"
                                    description="Receive push notifications in your browser"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Marketing Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">Marketing</CardTitle>
                        <CardDescription>Marketing and promotional content</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start space-x-3">
                            <Megaphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <FormSwitch
                                    form={form}
                                    name="marketing"
                                    label="Marketing Communications"
                                    description="Receive updates about new features and promotions"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Updates Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">Financial Updates</CardTitle>
                        <CardDescription>
                            Notifications about your financial activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <FormSwitch
                                    form={form}
                                    name="transactionAlerts"
                                    label="Transaction Alerts"
                                    description="Get notified when new transactions are detected"
                                />
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <FormSwitch
                                    form={form}
                                    name="weeklyReports"
                                    label="Weekly Reports"
                                    description="Receive weekly summaries of your financial activity"
                                />
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <FormSwitch
                                    form={form}
                                    name="monthlyReports"
                                    label="Monthly Reports"
                                    description="Receive monthly financial reports and insights"
                                />
                            </div>
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
