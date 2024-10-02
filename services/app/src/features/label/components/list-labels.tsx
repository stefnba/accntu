'use client';

import { Button } from '@/components/ui/button';
import { storeViewUpdateLabelSheet } from '@/features/label/store/view-update-label-sheet';
import { useState } from 'react';
import { LuChevronDown, LuChevronRight } from 'react-icons/lu';

import { useGetLabels } from '../api/get-labels';
import { LabelCard } from './label-card';

/**
 * List all labels on page.
 */
export const ListLabels = () => {
    const { data, isLoading } = useGetLabels({ level: '0' });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-1 gap-4 mt-4 max-w-[700px]">
            {data?.map((l) => <LabelCardForList label={l} key={l.id} />)}
        </div>
    );
};

const LabelCardForList = ({ label }: { label: any }) => {
    const { handleOpen } = storeViewUpdateLabelSheet();

    const [showChilds, setShowChilds] = useState(false);

    return (
        <div>
            <LabelCard
                label={label}
                onClick={() => handleOpen(label.id)}
                action={
                    label.childLabels &&
                    label.childLabels.length > 0 && (
                        <Button
                            // size="icon"
                            className="size-8 p-2"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowChilds(!showChilds);
                            }}
                        >
                            {!showChilds ? (
                                <LuChevronRight className="size-4" />
                            ) : (
                                <LuChevronDown className="size-4" />
                            )}
                        </Button>
                    )
                }
            />
            {showChilds &&
                label.childLabels &&
                label.childLabels.length > 0 && (
                    <ListChildLabels parentId={label.id} level={label.level} />

                    // <div className="mt-2 space-y-2 ml-8">
                    //     {label.childLabels.map((cl) => (
                    //         <LabelCard key={cl.id} label={cl} />
                    //         // <div key={cl.id}>{cl.name}</div>
                    //     ))}
                    // </div>
                )}
        </div>
    );
};

const ListChildLabels = ({
    parentId,
    level
}: {
    parentId: string;
    level: number;
}) => {
    const { data, isLoading } = useGetLabels({ parentId });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div
            style={{ paddingLeft: level + 1 * 50 }}
            className="grid grid-cols-1 gap-4 mt-4 mb-2 max-w-[800px]"
        >
            {data?.map((l) => <LabelCardForList label={l} key={l.id} />)}
        </div>
    );
};
