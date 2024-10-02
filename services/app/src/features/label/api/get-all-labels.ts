import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.labels.all.$get;

export type TLabelsResponse = InferResponseType<typeof query>;
export type TLabelsRequest = InferRequestType<typeof query>;

export const useGetAllLabels = () => {
    const q = useQuery({
        queryKey: ['labels'],
        queryFn: async () => {
            const response = await query();
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });
    return q;
};
