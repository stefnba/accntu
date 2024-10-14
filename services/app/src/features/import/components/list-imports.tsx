'use client';

import { useGetImports } from '@/features/import/api/get-imports';

import { ImportCard } from './import-card';

export const ListImports = () => {
    const { data, isLoading } = useGetImports();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 grid-cols-2 gap-4 py-2">
            {data?.map((i) => <ImportCard importRecord={i} key={i.id} />)}
        </div>
    );
};
