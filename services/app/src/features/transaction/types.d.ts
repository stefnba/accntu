import { schema } from '@/server/db/client';
import { type InferSelectModel, relations } from 'drizzle-orm';

export type TTransactionListQueryReturn = Omit<
    InferSelectModel<typeof schema.transaction>,
    'accountId' | 'labelId' | 'isDeleted'
> & {
    label: Pick<InferSelectModel<typeof schema.label>, 'id' | 'name'> | null;
    account: Pick<
        InferSelectModel<typeof schema.connectedAccount>,
        'id' | 'name'
    > | null;
};

export type TTransactionListActionReturn = {
    count: number;
    transactions: TTransactionListQueryReturn[];
};
