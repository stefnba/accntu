import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.labels.$get;

export type TLabelsResponse = InferResponseType<typeof query>;
export type TLabelsRequest = InferRequestType<typeof query>;

export const useGetLabels = (queryParams?: TLabelsRequest['query']) => {
    const q = useQuery({
        queryKey: [
            'labels',
            { level: queryParams?.level },
            { parentId: queryParams?.parentId }
        ],
        queryFn: async () => {
            const response = await query({
                query: queryParams || {}
            });
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });
    return q;
};
