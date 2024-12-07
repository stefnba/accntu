import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';

const query = client.api.user.me.$get;

export const useGetUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await query();
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }
    });
};
