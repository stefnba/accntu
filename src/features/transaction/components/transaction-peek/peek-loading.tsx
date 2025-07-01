import { Skeleton } from '@/components/ui/skeleton';

export const PeekLoading = () => {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    );
};