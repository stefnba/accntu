'use client';

import { cn } from '@/lib/utils';
import { renderLabelIcon } from '@/lib/utils/icon-renderer';
import { memo } from 'react';

const iconSizeMap = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
} as const;

interface LabelTreeItemIconProps {
    icon: string | null;
    color: string | null;
    className?: string;
}

export const LabelTreeItemIcon = memo(function LabelTreeItemIcon({
    className,
    icon,
    color,
}: LabelTreeItemIconProps) {
    const defaultColor = 'blue';
    const defaultIcon = 'folder';

    return (
        <div
            style={{ backgroundColor: color || defaultColor }}
            className={cn(
                'size-10 rounded-lg bg-blue-100 text-white flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0',
                className
            )}
        >
            {renderLabelIcon(icon || defaultIcon, iconSizeMap['lg'])}
        </div>
    );
});
