import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';

const query = client.api.import.$get;

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
