'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';
import { storeCreateConnectedBankModal } from '@/features/connectedBank/store/create-bank-modal';
import { ArrowLeft } from 'lucide-react';

import { AccountSelection } from './account-selection';
import { BankSelection } from './bank-selection';
import { CountrySelection } from './country-selection';

interface Props {}

export const CreateConnectedBankModal: React.FC<Props> = ({}) => {
    const { step, reset, setStep } = storeBankAccountCreate();
    const { isOpen, handleClose } = storeCreateConnectedBankModal();

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {step !== 'country-selection' && (
                            <Button
                                className="m-0 p-0"
                                variant="link"
                                size="sm"
                                onClick={() => setStep('country-selection')}
                            >
                                <ArrowLeft className="mr-2 size-6" />
                            </Button>
                        )}
                        New Account
                    </DialogTitle>
                </DialogHeader>

                {/* Steps */}
                {step === 'country-selection' && <CountrySelection />}
                {step === 'bank-selection' && <BankSelection />}
                {step === 'account-selection' && <AccountSelection />}
            </DialogContent>
        </Dialog>
    );
};
