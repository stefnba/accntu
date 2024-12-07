'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { AccountCustomSection } from '@/features/user/components/update-section';
import { useSession } from '@/hooks/session';

const LanguageSelect = () => {
    const { user } = useSession();

    return (
        <Select value={user?.settings.language || 'EN'}>
            <SelectTrigger className="w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="EN">English</SelectItem>
            </SelectContent>
        </Select>
    );
};

export const SettingsLanguageSection = () => {
    return (
        <>
            <AccountCustomSection
                title="Language"
                action={<LanguageSelect />}
            />
        </>
    );
};
