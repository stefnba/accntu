import { cn } from '@/lib/utils';
import React from 'react';
import type { DropProjection } from './tree-utilities';

export interface DropIndicatorProps {
    projection: DropProjection;
    className?: string;
}

export const DropIndicator: React.FC<DropIndicatorProps> = ({ projection, className }) => {
    const indentationStyle = {
        marginLeft: `${projection.depth * 32}px`,
    };

    return (
        <div
            className={cn(
                'relative flex items-center h-2 pointer-events-none',
                className
            )}
            style={indentationStyle}
        >
            {/* Main drop line */}
            <div 
                className={cn(
                    'absolute w-full h-0.5 rounded-full animate-pulse',
                    'bg-blue-500 shadow-lg shadow-blue-500/30',
                    'before:absolute before:w-2 before:h-2 before:bg-blue-500',
                    'before:rounded-full before:-left-1 before:-top-0.75',
                    'after:absolute after:w-2 after:h-2 after:bg-blue-500',
                    'after:rounded-full after:-right-1 after:-top-0.75'
                )}
            />
            
            {/* Depth indicator for nested drops */}
            {projection.depth > 0 && (
                <div 
                    className={cn(
                        'absolute left-0 top-0 bottom-0 w-0.5',
                        'bg-gradient-to-b from-blue-300 to-blue-500',
                        'opacity-60'
                    )}
                    style={{ left: `${(projection.depth - 1) * 32 + 16}px` }}
                />
            )}
            
            {/* Visual depth guides */}
            {Array.from({ length: projection.depth }, (_, i) => (
                <div
                    key={i}
                    className={cn(
                        'absolute w-4 h-0.5 bg-blue-300/50',
                        'rounded-full opacity-40'
                    )}
                    style={{ 
                        left: `${i * 32 + 8}px`,
                        top: '3px'
                    }}
                />
            ))}
        </div>
    );
};