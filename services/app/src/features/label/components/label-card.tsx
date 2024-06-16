import { SelectLabelSchema } from '@db/schema';
import { z } from 'zod';

import { LabelIcon } from './label-icon';

interface Props {
    // label: TLabelsResponse[0];
    label: z.infer<typeof SelectLabelSchema>;
    onClick?: () => void;
    action?: React.ReactNode;
}

export const LabelCard: React.FC<Props> = ({ label, onClick, action }) => {
    return (
        <div
            className="cursor-pointer flex border rounded-md px-4 py-3 align-middle items-center"
            onClick={onClick}
        >
            <LabelIcon color={label?.color} />
            <div className="text-xl font-medium">{label.name}</div>
            {action && <div className="ml-auto">{action}</div>}
        </div>
    );
};
