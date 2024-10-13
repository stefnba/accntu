'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';
import { ArrowLeft } from 'lucide-react';

import { AccountSelection } from './account-selection';
import { BankSelection } from './bank-selection';

interface Props {}

export const CreateConnectedBankModal: React.FC<Props> = ({}) => {
    const { step, setStep, isOpen, handleClose, header } =
        storeBankAccountCreate();

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="">
                <DialogHeader>
                    {header.title && (
                        <DialogTitle className="">
                            {/* {step !== 'bank-selection' && (
                                <Button
                                    className="m-0 p-0"
                                    variant="link"
                                    size="icon"
                                    onClick={() => setStep('bank-selection')}
                                >
                                    <ArrowLeft className="size-6" />
                                </Button>
                            )} */}
                            {header.title}
                        </DialogTitle>
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
