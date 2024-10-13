'use client';

import { Form, FormSubmit, useForm } from '@/components/form';
import { FormSwitch } from '@/components/form/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGetBank } from '@/features/bank/api';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';
import { SelectBankUploadAccountsSchema } from '@db/schema';
import { useEffect } from 'react';
import { z } from 'zod';

import { useCreateConnectedBank } from '../../api/create-connected-bank';
import { CreateAccountSchema } from '../../schema/create-connected-bank';
import { ConnectedAccountCard } from '../account-card';

const BankUploadAccountsSchema = SelectBankUploadAccountsSchema.pick({
    id: true,
    type: true
});

// interface Props {
//     bankId: string;
//     accounts: z.infer<typeof BankUploadAccountsSchema>[];
// }

const accountTypeMapping = {
    CREDIT_CARD: 'Credit Card',
    CURRENT: 'Current Account',
    SAVING: 'Savings Account'
};

interface Props {}

export const AccountSelection: React.FC<Props> = () => {
    const { bank: bankId, goBack } = storeBankAccountCreate();

    const { mutate: connectedBankMutate } = useCreateConnectedBank();

    const { data: bank } = useGetBank({ id: bankId });

    const bankAccountsForForm =
        bank?.accounts.map((account) => ({
            value: account.id,
            include: true
        })) || [];

    const form = useForm(CreateAccountSchema, {
        defaultValues: {
            bankId,
            accounts: bankAccountsForForm
        }
    });

    const { reset, watch } = form;

    useEffect(() => {
        const { unsubscribe } = watch((value) => {
            console.log(value);
        });
        return () => unsubscribe();
    }, [watch]);

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
        connectedBankMutate(values);
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
            <div className="font-semibold ">Account Types</div>
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
                onClick={() => goBack()}
                variant="outline"
                className="w-full my-2"
            >
                Go back
            </Button>
        </div>
    );
};
