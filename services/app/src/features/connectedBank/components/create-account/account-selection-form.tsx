'use client';

import { Form, FormSubmit, useForm } from '@/components/form';
import { FormSwitch } from '@/components/form/switch';
import { useMutation } from '@/lib/hooks/actions';
import { SelectBankUploadAccountsSchema } from '@db/schema';
import { z } from 'zod';

import { useCreateConnectedBank } from '../../api/create-connected-bank';
import { CreateAccountSchema } from '../../schema/reate-connected-bank';

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
            {accounts.map((a, index) => (
                <div
                    key={a.id}
                    className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2 w-full"
                >
                    <div className="space-y-0.5">
                        <div>{accountTypeMapping[a.type]}</div>
                    </div>
                    <FormSwitch
                        name={`accounts.${index}.include`}
                        form={form}
                    />
                </div>
            ))}
            <FormSubmit className="w-full" form={form}>
                Create Account
            </FormSubmit>
        </Form>
    );
};
