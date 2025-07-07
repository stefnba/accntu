'use client';

import { Button } from '@/components/ui/button';
import { RoutePath } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
    className?: string;
    path?: RoutePath;
}

export const BackButton = ({ className, path }: BackButtonProps) => {
    const router = useRouter();

    return (
        <Button
            className={cn('cursor-pointer', className)}
            variant="outline"
            size="sm"
            onClick={() => (path ? router.push(path) : router.back())}
        >
            <IconArrowLeft className="h-4 w-4" />
            Back
        </Button>
    );
};
