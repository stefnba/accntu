import { SelectItem } from '@/components/ui/select';

const labelColors = [
    { value: '#FB607F', label: 'Red' }, // ok
    { value: '#7BA05B', label: 'Green' }, // ok
    { value: '#318CE7', label: 'Blue' }, // ok
    { value: '#FFBF00', label: 'Amber' }, // ok
    { value: '#800080', label: 'Purple' },
    { value: '#FFC0CB', label: 'Pink' },
    { value: '#808080', label: 'Gray' },
    { value: '#00FFFF', label: 'Cyan' },
    { value: '#FF00FF', label: 'Magenta' },
    { value: '#355E3B', label: 'Dark Green' }, // ok
    { value: '#008080', label: 'Teal' }, // ok
    { value: '#FFDAB9', label: 'Peach' }, // ok
    { value: '#FA8072', label: 'Salmon' }, // ok
    { value: '#000080', label: 'Navy' },
    { value: '#9F8170', label: 'Beaver' }, // ok
    { value: '#B284BE', label: 'Violet' }, // ok
    { value: '#A52A2A', label: 'Auburn' }, // ok
    { value: '#0D98BA', label: 'Turquoise' } // ok
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
