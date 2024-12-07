'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { AccountCustomSection } from '@/features/user/components/update-section';
import { useSession } from '@features/auth/hooks/session';

const LanguageSelect = () => {
    const { user } = useSession();

    return (
        <Select defaultValue={user?.settings.language || undefined}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
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
