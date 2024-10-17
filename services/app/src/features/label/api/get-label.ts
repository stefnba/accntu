import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { InferRequestType } from 'hono';

const query = client.api.labels[':id'].$get;

export type TParam = InferRequestType<typeof query>['param'];

export const useGetLabel = ({ id }: Partial<TParam>) => {
    const q = useQuery({
        queryKey: ['label', { id }],
        enabled: !!id,
        queryFn: async () => {
            const response = await query({
                param: { id: id! }
            });
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });
    return q;
};
