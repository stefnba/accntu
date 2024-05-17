import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

const query = client.api.connected.banks.$get;

export type TConnectedBankResponse = InferResponseType<typeof query>;

export const useGetConnectedBanks = () => {
    const q = useQuery({
        queryKey: ['connected-banks'],
        queryFn: async () => {
            const response = await query();
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });
    return q;
};
