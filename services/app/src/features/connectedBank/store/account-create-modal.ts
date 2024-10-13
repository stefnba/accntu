import { create } from 'zustand';

const steps: Record<string, State['header']> = {
    'bank-selection': {
        title: 'Add Bank Account',
        description: 'Click on a bank provider to continue'
    },
    'account-selection': {
        description:
            'Toggle the account types you want to register for this bank'
    }
};

type TSteps = keyof typeof steps;

interface Actions {
    setStep: (step: TSteps) => void;
    setBank: (data: string) => void;
    reset: () => void;
    handleOpen: () => void;
    handleClose: () => void;
    goBack: () => void;
    // setHeader: (header: State['header']) => void;
}

interface State {
    step: TSteps;
    bank?: string;
    isOpen: boolean;
    header: {
        title?: string;
        description?: string;
    };
}

const firstStep: TSteps = 'bank-selection';

const initialState: State = {
    step: firstStep,
    bank: undefined,
    isOpen: false,
    header: steps[firstStep]
};
export const storeBankAccountCreate = create<Actions & State>()((set, get) => ({
    ...initialState,
    goBack: () => {
        const step = get().step;
        const currentPos = Object.keys(steps).indexOf(step);
        const newPos = currentPos - 1 < 0 ? 0 : currentPos - 1;
        set({ step: Object.keys(steps)[newPos] });
    },
    setStep: (step) => {
        const { title, description } = steps[step];

        set({
            step,
            header: {
                title: title || get().header.title,
                description: description || get().header.description
            }
        });
    },
    setBank: (bank) => set({ bank }),
    reset: () => set(initialState),
    handleClose: () => set(initialState),
    handleOpen: () => set({ isOpen: true })
    // setHeader: (header) => set({ header })
}));
