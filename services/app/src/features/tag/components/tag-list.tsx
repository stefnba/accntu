'use client';

import { useGetTags } from '@/features/tag/api/get-tags';
import { storeViewUpdateTagSheet } from '@/features/tag/store/crud-tag-sheet';

import { TagCard } from './tag-card';

/**
 * List all tags on page.
 */
export const ListTags = () => {
    const { data, isLoading } = useGetTags();
    const { handleOpen } = storeViewUpdateTagSheet();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-4 mt-4">
            {data?.map((t) => <TagCard tag={t} key={t.id} />)}
        </div>
    );
};
