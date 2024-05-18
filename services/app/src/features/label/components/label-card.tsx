import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { TLabelsResponse, useGetLabels } from '@/features/label/api/get-labels';
import { storeViewUpdateLabelSheet } from '@/features/label/store/view-update-label-sheet';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';
import { BiLabel } from 'react-icons/bi';
import { FcDown } from 'react-icons/fc';
import { LuTag } from 'react-icons/lu';
import { LuChevronDown, LuChevronRight } from 'react-icons/lu';
import { PiTagFill, PiTagSimpleFill } from 'react-icons/pi';

interface Props {
    label: TLabelsResponse[0];
}

export const LabelCard: React.FC<Props> = ({ label }) => {
    const { handleOpen } = storeViewUpdateLabelSheet();

    const [showChilds, setShowChilds] = useState(false);

    return (
        <div>
            <div
                className="cursor-pointer flex border rounded-md px-4 py-3 align-middle items-center"
                onClick={() => handleOpen(label.id)}
            >
                <div>
                    <BiLabel
                        style={{ color: label.color || 'primary' }}
                        className="size-6 mr-4"
                    />
                </div>
                <div className="text-xl font-semibold">{label.name}</div>
                {label.childLabels && label.childLabels.length > 0 && (
                    <div className="ml-auto">
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
                    </div>
                )}
            </div>
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
            style={{ paddingLeft: level + 1 * 20 }}
            className="grid grid-cols-1 gap-4 mt-4 max-w-[800px]"
        >
            {data?.map((l) => <LabelCard label={l} key={l.id} />)}
        </div>
    );
};
