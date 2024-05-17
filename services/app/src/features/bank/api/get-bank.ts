import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType } from 'hono/client';

const query = client.api.banks[':id'].$get;

type TParams = InferRequestType<typeof query>['param'];

export const useGetBank = (params: TParams) => {
    const q = useQuery({
        queryKey: ['bank', params?.id],
        queryFn: async () => {
            const res = await query({
                param: {
                    id: params?.id
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
