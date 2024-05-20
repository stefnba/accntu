import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { AccountCustomSection } from '@/features/user/components/update-section';

const ThemeSelect = () => {
    return (
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Coming Soon..." />
            </SelectTrigger>
            {/* <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
            </SelectContent> */}
        </Select>
    );
};

export const SettingsLanguageSection = () => {
    return (
        <>
            <AccountCustomSection
                // subTitle="asdfksf"
                title="Language"
                action={<ThemeSelect />}
            />
        </>
    );
};
