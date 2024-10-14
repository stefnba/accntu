'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';

import { AccountSelection } from './account-selection';
import { BankSelection } from './bank-selection';

interface Props {}

export const CreateConnectedBankModal: React.FC<Props> = ({}) => {
    const { step, isOpen, handleClose, header } = storeBankAccountCreate();

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="">
                <DialogHeader>
                    {header.title && (
                        <DialogTitle className="">{header.title}</DialogTitle>
                    )}

                    {header.description && (
                        <DialogDescription>
                            {header.description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Steps */}
                {step === 'bank-selection' && <BankSelection />}
                {step === 'account-selection' && <AccountSelection />}
            </DialogContent>
        </Dialog>
    );
};
