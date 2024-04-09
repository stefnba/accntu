import Link from 'next/link';

import { Button } from '@/components/ui/button';
import db from '@/db';

interface Props {
    country: string;
}

export const BankSelection = async ({ country }: Props) => {
    const banks = await db.bank.findMany({
        where: {
            country
        }
    });

    return (
        <div>
            <div>
                <Link
                    href={{
                        pathname: '/settings/account/new',
                        query: {}
                    }}
                >
                    <Button>Back</Button>
                </Link>
                <ul className="grid grid-cols-4 space-x-2">
                    {banks.map((bank) => (
                        <Link
                            href={{
                                // pathname: '/settings/account/new',
                                query: { bankId: bank?.id }
                            }}
                            key={bank?.id}
                        >
                            {bank?.name}
                        </Link>
                    ))}
                </ul>
            </div>
        </div>
    );
};