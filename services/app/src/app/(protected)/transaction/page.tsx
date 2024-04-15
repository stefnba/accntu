import { PageHeader } from '@/components/page/header';
import db from '@/db';
import { getUser } from '@/lib/auth';

import { TransactionTable } from './_components/table';

interface Props {
    params: {
        id: string;
    };
}

export default async function Transaction({}: Props) {
    const user = await getUser();
    const transactions = await db.transaction.findMany({
        where: {
            isDeleted: false,
            userId: user.id
        },
        include: {
            account: {
                select: {
                    name: true
                }
            },
            label: {
                select: {
                    name: true
                }
            }
        }
    });

    const transactionCount = await db.transaction.count({
        where: {
            isDeleted: false,
            userId: user.id
        }
    });

    console.log(transactions);

    return (
        <div>
            <PageHeader title="Transactions" />
            <TransactionTable transactionData={transactions} />
        </div>
    );
}
