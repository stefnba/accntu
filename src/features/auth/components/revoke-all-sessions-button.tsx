'use client';

import { Button } from '@/components/ui/button';
import { useAuthEndpoints } from '@/features/auth/api';
import { Loader2, LogOut } from 'lucide-react';

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function RevokeAllSessionsButton() {
    const { data, isLoading: isLoadingSessions } = useAuthEndpoints.getSessions({});
    const sessions = data?.sessions ?? [];
    const { mutate: revokeAllSessions, isPending: isRevokingAll } =
        useAuthEndpoints.revokeAllSessions();

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
            Revoke All
        </Button>
    );
}
