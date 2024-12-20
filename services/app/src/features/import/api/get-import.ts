import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType } from 'hono/client';

const query = client.api.import[':id'].$get;

type TParams = InferRequestType<typeof query>['param'];

/**
 * Fetch import record by id.
 */
export const useGetImport = (params: Partial<TParams>) => {
    const q = useQuery({
        enabled: !!params.id,
        queryKey: [
            'import',
            {
                id: params.id
            }
        ],
        queryFn: async () => {
            const res = await query({
                param: {
                    id: params.id!
                }
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });
    return q;
};
