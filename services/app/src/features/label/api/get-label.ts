import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { InferRequestType } from 'hono';

const query = client.api.labels[':id'].$get;

export const useGetLabel = (param: InferRequestType<typeof query>['param']) => {
    const q = useQuery({
        queryKey: ['label', { id: param.id }],
        enabled: !!param.id,
        queryFn: async () => {
            const response = await query({
                param
            });
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });
    return q;
};
