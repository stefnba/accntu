'use client';

import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { useCreateBankAccountModal } from '@features/connectedBank/hooks/create-account-modal';

import { AccountSelection } from './account-selection';
import { BankSelection } from './bank-selection';

interface Props {}

export const CreateBankAccountModal: React.FC<Props> = ({}) => {
    const { isOpen, handleClose, type } = useCreateBankAccountModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={handleClose}>
            {type === 'bank-selection' && <BankSelection />}
            {type === 'account-selection' && <AccountSelection />}
        </ResponsiveModal>
    );
};
