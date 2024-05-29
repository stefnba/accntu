import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

const query = client.api.connected.accounts.$get;

export type TConnectedBanksResponse = InferResponseType<typeof query>;

export const useGetConnectedBankAccounts = () => {
    const q = useQuery({
        queryKey: ['connected-bank-accounts'],
        queryFn: async () => {
            const response = await query();
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });
    return q;
};
