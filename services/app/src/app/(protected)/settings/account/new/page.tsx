import { PageHeader } from '@/components/page/header';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import db from '@/db';
import { getUser } from '@/lib/auth';

import { AccountSelection } from './_components/account-selection';
import { BankSelection } from './_components/bank-selection';
import { CountrySelection } from './_components/country-selection';

interface Props {
    searchParams: { country?: string; bankId?: string };
}

export default async function AccountCreate({ searchParams }: Props) {
    const { country, bankId } = searchParams;

    console.log('country', country);

    return (
        <div>
            <PageHeader title="New Account" />
            {!country && !bankId && <CountrySelection />}
            {country && <BankSelection country={country} />}
            {bankId && <AccountSelection bankId={bankId} />}
        </div>
    );
}
