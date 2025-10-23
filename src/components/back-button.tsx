'use client';

import { Button } from '@/components/ui/button';
import { RoutePath } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface BackButtonPropsPath {
    className?: string;
    path?: RoutePath;
}

interface BackButtonPropsOnClick {
    className?: string;
    onClick: () => void;
}

export const BackButton = (props: BackButtonPropsPath | BackButtonPropsOnClick) => {
    const router = useRouter();

    const handleClick = () => {
        if ('path' in props) {
            if (props.path) {
                router.push(props.path);
            } else {
                router.back();
            }
        } else if ('onClick' in props && typeof props.onClick === 'function') {
            props.onClick();
        }
    };

    return (
        <Button
            className={cn('cursor-pointer', props.className)}
            variant="outline"
            size="sm"
            onClick={handleClick}
        >
            <IconArrowLeft className="h-4 w-4" />
            Back
        </Button>
    );
};
