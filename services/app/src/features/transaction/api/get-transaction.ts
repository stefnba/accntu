import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const query = client.api.transactions[':transactionId'].$get;

type TGetTransactionsParams = InferRequestType<typeof query>['param'];
export type TGetTransactionsResult = InferResponseType<typeof query, 200>;

export const useGetTransaction = ({
    transactionId
}: Partial<TGetTransactionsParams>) => {
    const q = useQuery({
        enabled: !!transactionId,
        queryKey: ['transaction', transactionId],
        queryFn: async () => {
            const res = await query({
                param: { transactionId: transactionId! }
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });

    return q;
};
