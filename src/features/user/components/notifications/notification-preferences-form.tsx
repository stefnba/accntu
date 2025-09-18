'use client';

import { SettingsCard } from '@/components/content';
import { useForm } from '@/components/form';
import { Button } from '@/components/ui/button';

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
    const { form, Form, Switch } = useForm({
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
            <Form className="space-y-6">
                <SettingsCard.Auto
                    title="Communication"
                    items={[
                        {
                            icon: Mail,
                            label: 'Email Notifications',
                            description: 'Receive notifications via email',
                            action: (
                                <Switch
                                    name="email"
                                    label="Email Notifications"
                                    description="Receive notifications via email"
                                />
                            ),
                        },
                    ]}
                />

                {/* Communication Card */}
                <SettingsCard>
                    <SettingsCard.Header>
                        <SettingsCard.Title>Communication</SettingsCard.Title>
                        <SettingsCard.Description>
                            How you receive updates and messages
                        </SettingsCard.Description>
                    </SettingsCard.Header>
                    <SettingsCard.Content>
                        {/* Email Notifications */}
                        <SettingsCard.Item>
                            <SettingsCard.Icon icon={Mail} />
                            <SettingsCard.Body>
                                <Switch
                                    name="email"
                                    label="Email Notifications"
                                    description="Receive notifications via email"
                                />
                            </SettingsCard.Body>
                        </SettingsCard.Item>
                        {/* Push Notifications */}
                        <SettingsCard.Item>
                            <SettingsCard.Icon icon={Bell} />
                            <SettingsCard.Body>
                                <Switch
                                    name="push"
                                    label="Push Notifications"
                                    description="Receive push notifications in your browser"
                                />
                            </SettingsCard.Body>
                        </SettingsCard.Item>
                    </SettingsCard.Content>
                </SettingsCard>

                {/* Marketing Card */}
                <SettingsCard>
                    <SettingsCard.Header>
                        <SettingsCard.Title>Marketing</SettingsCard.Title>
                        <SettingsCard.Description>
                            Marketing and promotional content
                        </SettingsCard.Description>
                    </SettingsCard.Header>
                    <SettingsCard.Content>
                        {/* Marketing Communications */}
                        <SettingsCard.Item>
                            <SettingsCard.Icon icon={Megaphone} />
                            <SettingsCard.Body>
                                <Switch
                                    name="marketing"
                                    label="Marketing Communications"
                                    description="Receive updates about new features and promotions"
                                />
                            </SettingsCard.Body>
                        </SettingsCard.Item>
                    </SettingsCard.Content>
                </SettingsCard>

                {/* Financial Updates Card */}
                <SettingsCard>
                    <SettingsCard.Header>
                        <SettingsCard.Title>Financial Updates</SettingsCard.Title>
                        <SettingsCard.Description>
                            Notifications about your financial activity
                        </SettingsCard.Description>
                    </SettingsCard.Header>
                    <SettingsCard.Content>
                        {/* Transaction Alerts */}
                        <SettingsCard.Item>
                            <SettingsCard.Icon icon={TrendingUp} />
                            <SettingsCard.Body>
                                <Switch
                                    name="transactionAlerts"
                                    label="Transaction Alerts"
                                    description="Get notified when new transactions are detected"
                                />
                            </SettingsCard.Body>
                        </SettingsCard.Item>
                        {/* Weekly Reports */}
                        <SettingsCard.Item>
                            <SettingsCard.Icon icon={Calendar} />
                            <SettingsCard.Body>
                                <Switch
                                    name="weeklyReports"
                                    label="Weekly Reports"
                                    description="Receive weekly summaries of your financial activity"
                                />
                            </SettingsCard.Body>
                        </SettingsCard.Item>
                        {/* Monthly Reports */}
                        <SettingsCard.Item>
                            <SettingsCard.Icon icon={FileText} />
                            <SettingsCard.Body>
                                <Switch
                                    name="monthlyReports"
                                    label="Monthly Reports"
                                    description="Receive monthly financial reports and insights"
                                />
                            </SettingsCard.Body>
                        </SettingsCard.Item>
                    </SettingsCard.Content>
                </SettingsCard>

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
