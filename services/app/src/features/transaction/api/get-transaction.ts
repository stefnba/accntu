import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const query = client.api.transactions[':id'].$get;

type TGetTransactionsParams = InferRequestType<typeof query>['param'];
export type TGetTransactionsResult = InferResponseType<typeof query, 200>;

export const useGetTransaction = ({ id }: Partial<TGetTransactionsParams>) => {
    const q = useQuery({
        enabled: !!id,
        queryKey: ['transaction', id],
        queryFn: async () => {
            const res = await query({
                param: { id: id! }
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });

    return q;
};
