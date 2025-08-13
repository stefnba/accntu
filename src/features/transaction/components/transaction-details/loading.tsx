import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TransactionLoading = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-8 w-48" />
            </div>
            
            <Card className="animate-pulse">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-12 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};