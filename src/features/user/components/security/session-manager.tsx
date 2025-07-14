import {
    SettingsRow,
    SettingsRowActions,
    SettingsRowDescription,
    SettingsRowHeader,
    SettingsRowSection,
    SettingsRowTitle,
} from '@/components/settings-row';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const SessionManager = () => {
    return (
        <Card>
            <CardContent>
                <SettingsRowSection>
                    <SettingsRow>
                        <SettingsRowHeader>
                            <SettingsRowTitle>Active Sessions</SettingsRowTitle>
                            <SettingsRowDescription>
                                Manage your active sessions
                            </SettingsRowDescription>
                        </SettingsRowHeader>
                        <SettingsRowActions>
                            <Link href="/user/security/sessions">
                                <Button variant="outline">View</Button>
                            </Link>
                        </SettingsRowActions>
                    </SettingsRow>
                    <SettingsRow>
                        <SettingsRowHeader>
                            <SettingsRowTitle>Active Sessions</SettingsRowTitle>
                            <SettingsRowDescription>
                                Manage your active sessions
                            </SettingsRowDescription>
                        </SettingsRowHeader>
                        <SettingsRowActions>
                            <Link href="/user/security/sessions">
                                <Button variant="outline">View</Button>
                            </Link>
                        </SettingsRowActions>
                    </SettingsRow>
                </SettingsRowSection>
            </CardContent>
        </Card>
    );
};
