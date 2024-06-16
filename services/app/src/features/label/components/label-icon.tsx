import { PiTagSimpleFill } from 'react-icons/pi';

// BiLabel
// MdLabel
// LuTag
// PiTagFill
// PiTagSimpleFill

export const LabelIcon = ({ color }: { color?: string | null }) => {
    return (
        <PiTagSimpleFill
            style={{ color: color || 'primary' }}
            className="size-6 mr-4"
        />
    );
};
