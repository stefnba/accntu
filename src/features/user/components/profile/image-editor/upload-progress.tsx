'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IconCheck, IconLoader2, IconX } from '@tabler/icons-react';

interface UploadProgressProps {
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
    fileName?: string;
    onRetry?: () => void;
    onCancel?: () => void;
}

export function UploadProgress({
    progress,
    status,
    error,
    fileName,
    onRetry,
    onCancel,
}: UploadProgressProps) {
    const getStatusIcon = () => {
        switch (status) {
            case 'uploading':
                return <IconLoader2 className="w-5 h-5 animate-spin text-primary" />;
            case 'success':
                return <IconCheck className="w-5 h-5 text-green-600" />;
            case 'error':
                return <IconX className="w-5 h-5 text-red-600" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'uploading':
                return `Uploading... ${Math.round(progress)}%`;
            case 'success':
                return 'Upload complete!';
            case 'error':
                return error || 'Upload failed';
        }
    };

    const getProgressColor = () => {
        switch (status) {
            case 'uploading':
                return 'bg-primary';
            case 'success':
                return 'bg-green-600';
            case 'error':
                return 'bg-red-600';
        }
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        {getStatusIcon()}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                                {fileName || 'Profile Image'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {getStatusText()}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                        <Progress 
                            value={status === 'success' ? 100 : progress} 
                            className="h-2"
                        />
                        {status === 'uploading' && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{Math.round(progress)}%</span>
                                <span>Uploading to cloud storage...</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {status === 'error' && (
                        <div className="flex gap-2">
                            {onRetry && (
                                <Button size="sm" variant="outline" onClick={onRetry}>
                                    Retry
                                </Button>
                            )}
                            {onCancel && (
                                <Button size="sm" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-sm text-green-600 font-medium">
                            ✓ Your profile image has been updated successfully!
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}