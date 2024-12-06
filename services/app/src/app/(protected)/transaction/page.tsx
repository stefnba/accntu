import { PageHeader } from '@/components/page/header';
import { TransactionTable } from '@/features/transaction/components/table/table';

interface Props {}

export default async function Transaction({}: Props) {
    return (
        <>
            <PageHeader title="Transactions" />
            <TransactionTable />
        </>
    );
}
