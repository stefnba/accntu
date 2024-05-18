'use client';

import { useGetLabels } from '../api/get-labels';
import { LabelCard } from './label-card';

export const ListLabels = () => {
    const { data, isLoading } = useGetLabels({ level: '0' });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-1 gap-4 mt-4 max-w-[800px]">
            {data?.map((l) => <LabelCard label={l} key={l.id} />)}
        </div>
    );
};
