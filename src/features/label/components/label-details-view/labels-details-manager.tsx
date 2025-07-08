'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { useLabelEndpoints } from '@/features/label/api';

interface LabelDetailsViewManagerProps {
    labelId: string;
}

export const LabelDetailsViewManager = ({ labelId }: LabelDetailsViewManagerProps) => {
    const { data: label, isLoading } = useLabelEndpoints.getById({ param: { id: labelId } });

    if (isLoading) return <LoadingSpinner />;

    return <div>{label?.name}</div>;
};
