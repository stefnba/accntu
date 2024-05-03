import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { LuPlus } from 'react-icons/lu';

export const NewLabelCard = () => {
    return (
        <Card className="border-dashed cursor-pointer hover:shadow-md">
            <Link href="label/new">
                <div className="flex flex-col items-center justify-items-center h-full w-full justify-center">
                    <div className="flex items-center text-foreground">
                        <LuPlus className="h-5 w-5 mr-1" />
                        <span className="text-2xl font-semibold leading-none tracking-tight">
                            New
                        </span>
                    </div>
                </div>
            </Link>
        </Card>
    );
};
