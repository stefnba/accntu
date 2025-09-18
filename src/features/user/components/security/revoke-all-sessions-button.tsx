'use client';

import { Button } from '@/components/ui/button';
import { useAuthEndpoints } from '@/lib/auth/client';
import { Loader2, LogOut } from 'lucide-react';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export function RevokeAllSessionsButton() {
    const listsSessions = useAuthEndpoints.getActiveSessions();
    const sessions = listsSessions.data ?? [];
    const revokeOtherSessions = useAuthEndpoints.revokeOtherSessions();

    const handleRevokeAllSessions = useCallback(() => {
        revokeOtherSessions.mutate(
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
    }, [revokeOtherSessions.mutate]);

    if (listsSessions.isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <Button
            variant="destructive"
            onClick={handleRevokeAllSessions}
            disabled={listsSessions.isLoading || !sessions.length}
        >
            {revokeOtherSessions.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="mr-2 h-4 w-4" />
            )}
            Revoke All
        </Button>
    );
}
