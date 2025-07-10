'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LabelTreeRoot({ className, children }: React.ComponentProps<'div'>) {
    return (
        <Card data-slot="label-tree-root" className={cn('space-y-1', className)}>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
