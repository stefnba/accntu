import { toast } from '@/components/feedback';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeviceIcon } from '@/components/user-agent-device-icon';
import { TSession } from '@/lib/auth';
import { useAuthEndpoints } from '@/lib/auth/client';
import { formatDate } from '@/lib/utils/date-formatter';
import { parseUserAgent } from '@/lib/utils/user-agent';
import { Loader2, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

interface SessionCardProps {
    session: TSession;
    currentSessionId: string;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, currentSessionId }) => {
    const isCurrentSession = session.id === currentSessionId;
    const deviceInfo = parseUserAgent(session.userAgent);

    const revokeSession = useAuthEndpoints.revokeSession();

    const handleRevokeSession = useCallback(
        (token: string) => {
            revokeSession.mutate(
                { token },
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

    return (
        <Card key={session.id} className="relative">
            <CardHeader className="pb-2">
                {!isCurrentSession && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                className="absolute right-4 top-4 h-8 w-8 rounded-md p-1.5 text-muted-foreground opacity-70 transition-opacity hover:bg-muted hover:opacity-100 disabled:pointer-events-none disabled:opacity-30"
                                onClick={() => handleRevokeSession(session.token)}
                                disabled={isCurrentSession || revokeSession.isPending}
                                aria-label="Revoke session"
                            >
                                {revokeSession.isPending ? (
                                    <Loader2 className="h-full w-full animate-spin" />
                                ) : (
                                    <Trash2 className="h-full w-full" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Revoke this session</TooltipContent>
                    </Tooltip>
                )}
                <CardTitle className="flex items-center">
                    <DeviceIcon userAgent={session.userAgent} />
                    {deviceInfo.shortName}
                    {isCurrentSession && (
                        <Badge variant="outline" className="ml-2">
                            Current
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                {session.lastActiveAt
                                    ? `Last active ${formatDate(session.lastActiveAt).smart()}`
                                    : 'Never active'}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {session.lastActiveAt
                                ? formatDate(session.lastActiveAt).toDateTimeString()
                                : 'Never active'}
                        </TooltipContent>
                    </Tooltip>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="text-sm text-gray-500">
                                Expires: {formatDate(session.expiresAt).relativeTime()}
                            </p>
                        </TooltipTrigger>
                        <TooltipContent>
                            {formatDate(session.expiresAt).toDateTimeString()}
                        </TooltipContent>
                    </Tooltip>
                    <p>IP: {session.ipAddress || 'Unknown'}</p>
                    <p>
                        Device: {deviceInfo.device.vendor} {deviceInfo.device.model}
                    </p>
                    <p>
                        Broser: {deviceInfo.browser.name} {deviceInfo.browser.version}
                    </p>
                    <p>
                        System: {deviceInfo.os.name} {deviceInfo.os.version}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
