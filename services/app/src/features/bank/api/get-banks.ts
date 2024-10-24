import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const query = client.api.banks.$get;

type TParams = InferRequestType<typeof query>['query'];
export type TGetBanksResult = InferResponseType<typeof query, 200>;

export const useGetBanks = (params?: TParams) => {
    return useQuery({
        queryKey: ['banks', { country: params?.country }],
        queryFn: async () => {
            const res = await client.api.banks.$get({
                query: params || {}
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });
};
