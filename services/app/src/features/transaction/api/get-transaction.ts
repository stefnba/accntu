import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType } from 'hono/client';

const query = client.api.transactions[':id'].$get;

type TGetTransactionsParams = InferRequestType<typeof query>['param'];

export const useGetTransaction = (params?: TGetTransactionsParams) => {
    const q = useQuery({
        enabled: !!params?.id,
        queryKey: ['transaction', params?.id],
        queryFn: async () => {
            const res = await query({
                param: params || { id: undefined }
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });

    return q;
};
