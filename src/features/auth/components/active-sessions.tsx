'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuthEndpoints } from '@/features/auth/api';

import { Loader2, LogOut, Shield, Smartphone } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function ActiveSessions() {
    const { data, isLoading: isLoadingSessions } = useAuthEndpoints.getSessions({});
    const sessions = data?.sessions ?? [];
    const { mutate: revokeSession, isPending: isRevokingSession } =
        useAuthEndpoints.revokeSession();
    const { mutate: revokeAllSessions, isPending: isRevokingAll } =
        useAuthEndpoints.revokeAllSessions();

    const handleRevokeSession = useCallback(
        (sessionId: string) => {
            revokeSession(
                { param: { sessionId } },
                {
                    onSuccess: () => {
                        toast.success('Session revoked');
                    },
                    onError: () => {
                        toast.error('Failed to revoke session. Please try again.');
                    },
                }
            );
        },
        [revokeSession]
    );

    const handleRevokeAllSessions = useCallback(() => {
        revokeAllSessions(
            {},
            {
                onSuccess: () => {
                    toast.success('All sessions revoked');
                },
                onError: () => {
                    toast.error('Failed to revoke sessions. Please try again.');
                },
            }
        );
    }, [revokeAllSessions]);

    if (isLoadingSessions) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Active Sessions</h2>
                    <p className="text-muted-foreground">
                        Manage your active sessions across different devices.
                    </p>
                </div>
                <Button
                    variant="destructive"
                    onClick={handleRevokeAllSessions}
                    disabled={isRevokingAll || !sessions.length}
                >
                    {isRevokingAll ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Revoke All Other Sessions
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                    <Card key={session.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                {session.userAgent?.includes('Mobile') ? (
                                    <Smartphone className="mr-2 h-4 w-4" />
                                ) : (
                                    <Shield className="mr-2 h-4 w-4" />
                                )}
                                {session.userAgent?.split('/')?.[0] || 'Unknown Device'}
                                {session.isCurrent && (
                                    <Badge variant="outline" className="ml-2">
                                        Current
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {session.lastActiveAt
                                    ? `Last active ${new Date(session.lastActiveAt).toLocaleString()}`
                                    : 'Never active'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                <p>IP: {session.ipAddress || 'Unknown'}</p>
                                <p>Expires: {new Date(session.expiresAt).toLocaleString()}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={isRevokingSession}
                            >
                                {isRevokingSession ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LogOut className="mr-2 h-4 w-4" />
                                )}
                                Revoke Session
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {!sessions.length && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No other active sessions found.
                    </div>
                )}
            </div>
        </div>
    );
}
