import { AccountSection } from '../../_components/section';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

const ThemeSelect = () => {
    return (
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Coming Soon..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
            </SelectContent>
        </Select>
    );
};

const AppareanceThemeSection = () => {
    return (
        <>
            <AccountSection title="Theme" action={<ThemeSelect />} />
        </>
    );
};

export default AppareanceThemeSection;
