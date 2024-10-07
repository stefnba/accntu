import { errorToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const query = client.api.import[':id']['preview'][':fileId'].$get;

type TParams = Partial<InferRequestType<typeof query>['param']>;
export type TPreviewTransactionReponse = InferResponseType<typeof query>;

/**
 * Fetch preview transactions for an import by importId and fileId.
 * This will return a list of transactions.
 */
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
            if (!params.id || !params.fileId) {
                throw new Error('Missing required parameters');
            }

            const res = await query({
                param: {
                    id: params.id,
                    fileId: params.fileId
                }
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
