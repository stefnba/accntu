import {
    CardDescription,
    CardHeader,
    CardTitle,
    NavCard
} from '@/components/ui/card';
import { RiHotelBedLine } from 'react-icons/ri';

import { LabelCardEdit } from './label-card-edit';
import { TLabel } from './label-selection/types';

interface Props {
    label: TLabel;
}

export const LabelCard: React.FC<Props> = ({ label }) => {
    const hasChildLabels = label.childLabels.length > 0;

    return (
        <NavCard
            href={`label/${label.id}`}
            className="border cursor-pointer hover:shadow-md h-full group"
            key={label.id}
        >
            <div className="relative">
                <div className="flex items-center ml-6">
                    <div className="">
                        <RiHotelBedLine className="h-8 w-8 text-primary/50" />
                    </div>
                    <LabelCardEdit label={label} />
                    <CardHeader>
                        <CardTitle className="">{label.name}</CardTitle>
                        <CardDescription>
                            {hasChildLabels
                                ? `${label.childLabels.length} label${label.childLabels.length > 1 ? 's' : ''}`
                                : 'No labels'}
                        </CardDescription>
                    </CardHeader>
                </div>
            </div>
        </NavCard>
    );
};
