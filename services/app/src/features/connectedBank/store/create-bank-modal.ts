import { create } from 'zustand';

import { storeBankAccountCreate } from './account-create-modal';

interface IStoreCreateConnectedBankModal {
    isOpen: boolean;
    handleOpen: () => void;
    handleClose: () => void;
}

export const storeCreateConnectedBankModal =
    create<IStoreCreateConnectedBankModal>((set) => ({
        isOpen: false,
        handleOpen: () => set({ isOpen: true }),
        handleClose: () => {
            // Reset the account creation steps
            storeBankAccountCreate.setState({
                step: 'country-selection',
                country: undefined,
                bank: undefined
            });
            set({ isOpen: false });
        }
    }));
