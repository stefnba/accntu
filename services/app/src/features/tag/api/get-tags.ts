import { client } from '@/lib/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.tags.$get;

export type TResponse = InferResponseType<typeof query, 200>;
export type TRequest = InferRequestType<typeof query>;

export const useGetTags = (queryParams?: TRequest['query']) => {
    const queryClient = useQueryClient();
    const q = useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const response = await query({
                query: queryParams || {}
            });
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });

    queryClient.invalidateQueries({ queryKey: ['tags'] });

    return q;
};
