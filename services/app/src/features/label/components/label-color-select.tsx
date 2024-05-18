import { SelectItem } from '@/components/ui/select';

const labelColors = [
    { value: '#FF0000', label: 'Red' },
    { value: '#008000', label: 'Green' },
    { value: '#0000FF', label: 'Blue' },
    { value: '#FFFF00', label: 'Yellow' },
    { value: '#800080', label: 'Purple' },
    { value: '#FFC0CB', label: 'Pink' },
    { value: '#808080', label: 'Gray' },
    { value: '#00FFFF', label: 'Cyan' },
    { value: '#FF00FF', label: 'Magenta' },
    { value: '#00FF00', label: 'Lime' },
    { value: '#008080', label: 'Teal' },
    { value: '#FFDAB9', label: 'Peach' },
    { value: '#FFD700', label: 'Gold' },
    { value: '#FA8072', label: 'Salmon' },
    { value: '#000080', label: 'Navy' }
];

export const LabelColorDot = ({ color }: { color: string }) => {
    return (
        <div
            style={{ background: color }}
            className="size-4 mr-2 rounded-full bg-primary-500"
        />
    );
};

export const ColorSelectContent = () => {
    return (
        <>
            {labelColors.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center">
                        <LabelColorDot color={color.value} />
                        {color.label}
                    </div>
                </SelectItem>
            ))}
        </>
    );
};
