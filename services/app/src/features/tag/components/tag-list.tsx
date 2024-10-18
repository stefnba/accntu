'use client';

import { useGetTags } from '@/features/tag/api/get-tags';
import { storeViewUpdateTagSheet } from '@/features/tag/store/view-update-label-sheet';

/**
 * List all tags on page.
 */
export const ListTags = () => {
    const { data, isLoading } = useGetTags();
    const { handleOpen } = storeViewUpdateTagSheet();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-1 gap-4 mt-4 max-w-[700px]">
            {data?.map((t) => (
                <div onClick={() => handleOpen(t.id)} key={t.id}>
                    {t.name}
                </div>
            ))}
        </div>
    );
};
