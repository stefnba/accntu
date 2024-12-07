'use client';

import { successToast } from '@/components/toast';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { AccountCustomSection } from '@/features/user/components/update-section';
import dayjs from 'dayjs';
import { Search } from 'lucide-react';
import * as React from 'react';

import { useUpdateUser } from '../../api/update-user';

const timezones: Record<
    string,
    { key: string; label: string; offset: number }[]
> = {
    'North America': [
        { key: 'hst', label: 'Hawaii Standard Time (HST)', offset: -600 },
        { key: 'akst', label: 'Alaska Standard Time (AKST)', offset: -540 },
        { key: 'pst', label: 'Pacific Standard Time (PST)', offset: -480 },
        { key: 'mst', label: 'Mountain Standard Time (MST)', offset: -420 },
        { key: 'cst', label: 'Central Standard Time (CST)', offset: -360 },
        { key: 'est', label: 'Eastern Standard Time (EST)', offset: -300 }
    ],
    'South America': [
        { key: 'bot', label: 'Bolivia Time (BOT)', offset: -240 },
        { key: 'clt', label: 'Chile Standard Time (CLT)', offset: -240 },
        { key: 'art', label: 'Argentina Time (ART)', offset: -180 },
        { key: 'brt', label: 'Brasilia Time (BRT)', offset: -180 }
    ],
    'Europe & Africa': [
        { key: 'gmt', label: 'Greenwich Mean Time (GMT)', offset: 0 },
        { key: 'cet', label: 'Central European Time (CET)', offset: 60 },
        {
            key: 'west',
            label: 'Western European Summer Time (WEST)',
            offset: 60
        },
        { key: 'eet', label: 'Eastern European Time (EET)', offset: 120 },
        { key: 'cat', label: 'Central Africa Time (CAT)', offset: 120 },
        { key: 'eat', label: 'East Africa Time (EAT)', offset: 180 },
        { key: 'msk', label: 'Moscow Time (MSK)', offset: 180 }
    ],
    Asia: [
        { key: 'ist', label: 'India Standard Time (IST)', offset: 330 },
        { key: 'cst_china', label: 'China Standard Time (CST)', offset: 480 },
        {
            key: 'wita',
            label: 'Indonesia Central Standard Time (WITA)',
            offset: 480
        },
        { key: 'jst', label: 'Japan Standard Time (JST)', offset: 540 },
        { key: 'kst', label: 'Korea Standard Time (KST)', offset: 540 }
    ],
    'Australia & Pacific': [
        {
            key: 'awst',
            label: 'Australian Western Standard Time (AWST)',
            offset: 480
        },
        {
            key: 'acst',
            label: 'Australian Central Standard Time (ACST)',
            offset: 570
        },
        {
            key: 'aest',
            label: 'Australian Eastern Standard Time (AEST)',
            offset: 600
        },
        { key: 'nzst', label: 'New Zealand Standard Time (NZST)', offset: 720 },
        { key: 'fjt', label: 'Fiji Time (FJT)', offset: 720 }
    ]
};

export function TimezoneSelect() {
    // todo get timzeone from user saved

    const { mutate: updateUser } = useUpdateUser('apparence');

    const handleSelect = (value: string) => {
        updateUser(
            {
                settings: {
                    timezone: value
                }
            },
            {
                onSuccess: () => {
                    successToast('Timezone updated');
                }
            }
        );
    };

    return (
        <Select defaultValue="cet" onValueChange={handleSelect}>
            <SelectTrigger className="min-w-60">
                <SelectValue
                    className="text-left flex justify-start flex-col"
                    placeholder="Timezone"
                />
            </SelectTrigger>
            <SelectContent className="">
                {Object.entries(timezones).map(([c, t]) => (
                    <SelectGroup key={c}>
                        <SelectLabel>{c}</SelectLabel>
                        {t.map((z) => (
                            <SelectItem
                                className="text-left"
                                key={z.key}
                                value={z.key}
                            >
                                {z.label}
                                <span className="text-muted-foreground mx-1">
                                    {`${z.offset > 0 ? '+' : ''}${Math.floor(
                                        z.offset / 60
                                    ).toString()}${
                                        z.offset % 60 !== 0
                                            ? `:${Math.abs(z.offset % 60)
                                                  .toString()
                                                  .padStart(2, '0')}`
                                            : ''
                                    }h`}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    );
}

export const SettingsTimezoneSection = () => {
    return (
        <>
            <AccountCustomSection
                title="Timezone"
                action={<TimezoneSelect />}
            />
        </>
    );
};
