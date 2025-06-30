import { cn } from '@/lib/utils';
import React from 'react';

interface LoadingSpinner {
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinner> = ({ className }) => (
    <div
        className={cn(
            'w-10 h-10 rounded-full border-4 border-t-transparent border-b-transparent border-blue-500 animate-spin',
            className
        )}
    />
);
