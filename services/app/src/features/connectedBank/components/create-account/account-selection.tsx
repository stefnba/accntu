'use client';

import { Form, FormSubmit, useForm } from '@/components/form';
import { FormSwitch } from '@/components/form/switch';
import { successToast } from '@/components/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGetBank } from '@/features/bank/api';
import { useCreateConnectedBank } from '@/features/connectedBank/api/create-connected-bank';
import { ConnectedAccountCard } from '@/features/connectedBank/components/account-card';
import { useCreateBankAccountModal } from '@/features/connectedBank/hooks/create-account-modal';
import { CreateAccountSchema } from '@/features/connectedBank/schema/create-connected-bank';
import { useEffect } from 'react';
import { z } from 'zod';

const accountTypeMapping = {
    CREDIT_CARD: 'Credit Card',
    CURRENT: 'Current Account',
    SAVING: 'Savings Account'
};

interface Props {}

export const AccountSelection: React.FC<Props> = () => {
    const { bankId, handleOpen, setBankId, handleClose } =
        useCreateBankAccountModal();

    const { mutate: connectedBankMutate } = useCreateConnectedBank();

    const { data: bank } = useGetBank({ id: bankId || undefined });

    const bankAccountsForForm =
        bank?.accounts.map((account) => ({
            value: account.id,
            include: true
        })) || [];

    const form = useForm(CreateAccountSchema, {
        defaultValues: {
            bankId: bankId || undefined,
            accounts: bankAccountsForForm
        }
    });

    const { reset } = form;

    useEffect(() => {
        reset({
            bankId: bank?.id,
            accounts: bank?.accounts.map((account) => ({
                value: account.id,
                include: true
            }))
        });
    }, [reset, bank]);

    if (!bank || !bankId) {
        return <div>Bank not found</div>;
    }

    const handleSubmit = (values: z.infer<typeof CreateAccountSchema>) => {
        connectedBankMutate(values, {
            onSuccess: () => {
                handleClose();
                setBankId(null);
                successToast('Account has been created');
            }
        });
    };

    return (
        <div>
            <div
                style={{ backgroundColor: bank.color || undefined }}
                className="mb-4 flex w-full justify-center py-4 rounded-md"
            >
                <div className="flex items-center">
                    <Avatar className="size-14 p-2 mr-3 border bg-white">
                        {bank.logo && <AvatarImage src={bank.logo} />}
                        <AvatarFallback>
                            {Array.from(bank.name)[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-2xl font-semibold text-white">
                        {bank.name}
                    </div>
                </div>
            </div>

            {/* Accounts */}
            <Label className="">Account Types</Label>
            <p className="mb-4 text-sm text-muted-foreground">
                Toggle the account types you want to register for {bank.name}
            </p>
            <Form form={form} onSubmit={handleSubmit}>
                <div className="space-y-2">
                    {bank.accounts.map((a, index) => (
                        <ConnectedAccountCard
                            key={a.id}
                            name={accountTypeMapping[a.type]}
                            type={a.type}
                            action={
                                <FormSwitch
                                    name={`accounts.${index}.include`}
                                    form={form}
                                />
                            }
                            color={bank?.color || undefined}
                        />
                    ))}
                </div>
                <FormSubmit className="w-full mt-6" form={form}>
                    Create Account
                </FormSubmit>
            </Form>
            <Button
                onClick={() => {
                    handleOpen('bank-selection');
                    setBankId(null);
                }}
                variant="outline"
                className="w-full my-2"
            >
                Go back
            </Button>
        </div>
    );
};
