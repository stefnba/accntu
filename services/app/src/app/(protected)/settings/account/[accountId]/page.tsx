import { accountActions } from '@/actions';
import { PageHeader } from '@/components/page/header';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { getUser } from '@/lib/auth';

interface Props {
    params: {
        accountId: string;
    };
}

export default async function OneAccount({ params }: Props) {
    const user = await getUser();
    const { accountId } = params;

    const { success: account } = await accountActions.findAccountById({
        id: accountId
    });

    if (!account) {
        return <div>Account not found</div>;
    }

    return (
        <div>
            <PageHeader title={account.name} />
            {/* <p>{account.type}</p>
            <p>{account.accountParent?.id}</p>
            <p>{account.bank.name}</p> */}
            <p>
                {/* {account.transactionAccount.map((a) => (
                    <li key={a.id}>{a.name}</li>
                ))} */}
            </p>
        </div>
    );
}
