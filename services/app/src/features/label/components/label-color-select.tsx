import { SelectItem } from '@/components/ui/select';
import { colorSelection } from '@/lib/constants';

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
            {colorSelection.map((color) => (
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
