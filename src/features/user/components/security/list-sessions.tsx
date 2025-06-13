'use client';

import { SessionCard } from '@/features/user/components/security/session-card';

import { useAuthEndpoints } from '@/lib/auth/client';
import { Loader2 } from 'lucide-react';

export function ListActiveSessions() {
    const listSessions = useAuthEndpoints.listsSessions({});
    const sessions = listSessions.data ?? [];

    if (listSessions.isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                    <SessionCard key={session.id} session={session} currentSessionId="d" />
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
