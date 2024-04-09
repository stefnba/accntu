'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { accountActions } from '@/actions';
import { CreatAccountSchema } from '@/actions/account/create';
import { Form, FormSubmit, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import db from '@/db';
import { useMutation } from '@/hooks/mutation';
import { BankUploadAccounts } from '@prisma/client';
import { useEffect } from 'react';

interface Props {
    bankId: string;
    accounts: BankUploadAccounts[];
}

export const AccountSelectionForm = ({ bankId, accounts }: Props) => {
    const form = useForm(CreatAccountSchema, {
        defaultValues: {
            bankId,
            accounts: []
        }
    });

    const router = useRouter();

    const { execute } = useMutation(accountActions.create, {
        onSuccess: (accounts) => {
            router.push(`/settings/account/${accounts.id}`);
        }
    });

    const formAccounts = form.watch('accounts');

    const handleSwitchAccount = (id: string) => {
        if (!formAccounts.includes(id)) {
            form.setValue('accounts', [...formAccounts, id]);
        } else {
            form.setValue(
                'accounts',
                formAccounts.filter((accountId) => accountId !== id)
            );
        }
        form.trigger('accounts');
    };

    return (
        <div>
            <div>
                {accounts?.map((account) => (
                    <div key={account.id} className="mt-4">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-80">
                            <div className="space-y-0.5">
                                <div>{account.type}</div>
                            </div>
                            <div>
                                <Switch
                                    checked={formAccounts.includes(account.id)}
                                    onCheckedChange={() =>
                                        handleSwitchAccount(account.id)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Form form={form} onSubmit={execute}>
                <FormSubmit form={form} />
            </Form>
        </div>
    );
};