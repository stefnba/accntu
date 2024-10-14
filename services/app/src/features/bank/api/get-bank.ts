import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const query = client.api.banks[':id'].$get;

type TParams = InferRequestType<typeof query>['param'];
export type TBankResponse = InferResponseType<typeof query, 200>;

/**
 * Fetch a bank by Id from API endpoint.
 */
export const useGetBank = ({ id }: Partial<TParams>) => {
    const q = useQuery({
        queryKey: ['bank', id],
        enabled: !!id,
        queryFn: async () => {
            const res = await query({
                param: {
                    id: id!
                }
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });

    // if (q.isError) {
    //     console.log(q.error);
    // }

    return q;
};
