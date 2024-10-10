import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { InferRequestType } from 'hono';

const query = client.api.connected.banks[':id'].$get;

export const useGetConnectedBank = ({
    id
}: Partial<InferRequestType<typeof query>['param']>) => {
    const q = useQuery({
        queryKey: ['connected-bank', { id }],
        enabled: !!id,
        queryFn: async () => {
            const response = await query({
                param: {
                    id: id!
                }
            });
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });
    return q;
};
