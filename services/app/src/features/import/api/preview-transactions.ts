import { errorToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType } from 'hono/client';

const query = client.api.import[':id']['preview'][':fileId'].$get;

type TParams = InferRequestType<typeof query>['param'];

export const usePreviewTransactions = (params: TParams) => {
    const q = useQuery({
        enabled: !!params.id && !!params.fileId,
        queryKey: [
            'import-preview-transactions',
            {
                id: params.id,
                fileId: params.fileId
            }
        ],
        queryFn: async () => {
            const res = await query({
                param: params
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });

    if (q.error && q.failureCount === 1) {
        errorToast(q.error.message);
    }

    return q;
};
