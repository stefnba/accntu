import { SettingsCard } from '@/components/content';
import { Button } from '@/components/ui/button';
import { Monitor, Shield } from 'lucide-react';
import Link from 'next/link';

export const SessionManager = () => {
    return (
        <div className="space-y-6">
            <SettingsCard.Auto
                items={[
                    {
                        icon: Monitor,
                        label: 'Active Sessions',
                        description: 'Manage your active sessions',
                        action: (
                            <Link href="/user/security/sessions">
                                <Button variant="outline">View</Button>
                            </Link>
                        ),
                    },
                    {
                        icon: Shield,
                        label: 'Security Settings',
                        description: 'Configure additional security options',
                        action: (
                            <Link href="/user/security">
                                <Button variant="outline">Manage</Button>
                            </Link>
                        ),
                    },
                ]}
            />
        </div>
    );
};
