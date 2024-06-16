'use client';

import { Form, FormSubmit, useForm } from '@/components/form';
import { FormSwitch } from '@/components/form/switch';
import { SelectBankUploadAccountsSchema } from '@db/schema';
import { z } from 'zod';

import { useCreateConnectedBank } from '../../api/create-connected-bank';
import { CreateAccountSchema } from '../../schema/reate-connected-bank';
import { ConnectedAccountCard } from '../account-card';

const BankUploadAccountsSchema = SelectBankUploadAccountsSchema.pick({
    id: true,
    type: true
});

interface Props {
    bankId: string;
    accounts: z.infer<typeof BankUploadAccountsSchema>[];
}

const accountTypeMapping = {
    CREDIT_CARD: 'Credit Card',
    CURRENT: 'Current Account',
    SAVING: 'Savings Account'
};

export const AccountSelectionForm: React.FC<Props> = ({ bankId, accounts }) => {
    const form = useForm(CreateAccountSchema, {
        defaultValues: {
            bankId,
            accounts: accounts.map((account) => ({
                value: account.id,
                include: true
            }))
        }
    });

    const { mutate } = useCreateConnectedBank();

    const handleSubmit = (values: z.infer<typeof CreateAccountSchema>) => {
        mutate(values);
    };

    return (
        <Form form={form} onSubmit={handleSubmit}>
            <div className="space-y-2">
                {accounts.map((a, index) => (
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
                    />
                    // <div
                    //     key={a.id}
                    //     className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full"
                    // >
                    //     <div className="space-y-0.5">
                    //         <div>{accountTypeMapping[a.type]}</div>
                    //     </div>

                    // </div>
                ))}
            </div>
            <FormSubmit className="w-full mt-6" form={form}>
                Create Account
            </FormSubmit>
        </Form>
    );
};
