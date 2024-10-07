import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

const query = client.api.import.$get;

export type ImportResponse = InferResponseType<typeof query>;

/**
 * Fetch all import records for given user.
 */
export const useGetImports = () => {
    const q = useQuery({
        queryKey: ['imports'],
        queryFn: async () => {
            const res = await query();

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });
    return q;
};
