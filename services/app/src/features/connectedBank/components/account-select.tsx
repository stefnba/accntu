import { FormCombobox } from '@/components/form';
import { Button } from '@/components/ui/button';
import type {
    FieldPath,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn
} from 'react-hook-form';

import { useGetConnectedBankAccounts } from '../api/get-connected-bank-accounts';

type TOptions<TFieldValues> = {
    label: string;
    value: PathValue<TFieldValues, Path<TFieldValues>>;
}[];

interface Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
    name: TName;
    form: UseFormReturn<TFieldValues>;
}

export const BankAccountSelect = <TFieldValues extends FieldValues>({
    form,
    name
}: Props<TFieldValues>) => {
    const { data } = useGetConnectedBankAccounts();

    const accounts = data?.map(({ account, bank }) => ({
        label: <AccountSelectItem name={account.name} bank={bank.name} />,
        value: account?.id
    }));

    return (
        <FormCombobox
            label="Bank Account"
            form={form}
            name={name}
            options={accounts || []}
        />
    );
};

const AccountSelectItem = ({ name, bank }: { name: string; bank: string }) => {
    return (
        <div>
            {name} - {bank}
        </div>
    );
};
