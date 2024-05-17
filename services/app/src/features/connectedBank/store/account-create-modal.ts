import { create } from 'zustand';

type TBankAccountCreateModalSteps =
    | 'country-selection'
    | 'bank-selection'
    | 'account-selection';

interface IStoreBankAccountCreate {
    step: TBankAccountCreateModalSteps;
    setStep: (step: TBankAccountCreateModalSteps) => void;
    bank?: string;
    setBank: (data: string) => void;
    country?: string;
    setCountry: (country: string) => void;
    reset: () => void;
}

export const storeBankAccountCreate = create<IStoreBankAccountCreate>(
    (set) => ({
        step: 'country-selection',
        setStep: (step) => set({ step }),
        country: undefined,
        setCountry: (country) => set({ country, step: 'bank-selection' }),
        bank: undefined,
        setBank: (bank) => set({ bank, step: 'account-selection' }),
        reset: () => {
            set({
                country: undefined,
                step: 'country-selection',
                bank: undefined
            });
        }
    })
);
