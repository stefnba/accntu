'use client';

import { DialogDescription } from '@/components/ui/dialog';
import { BankAccountCard } from '@/features/connectedBank/components/account-card';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';

const COUNTRIES = [
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' }
];

interface Props {}

export const CountrySelection: React.FC<Props> = () => {
    const setCountry = storeBankAccountCreate((store) => store.setCountry);

    return (
        <div>
            <DialogDescription>Select a country</DialogDescription>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {COUNTRIES.map((c) => (
                    <BankAccountCard
                        key={c.code}
                        label={c.flag}
                        onClick={() => setCountry(c.code)}
                    />
                ))}
            </div>
        </div>
    );
};
