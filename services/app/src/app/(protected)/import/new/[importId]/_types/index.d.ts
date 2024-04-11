import type { TTransaction } from '@/actions/transaction/create/schema';

export interface IFile {
    id: string;
    filename: string | null;
    url: string;
}

export type TParsedTransaction = TTransaction & {
    is_duplicate: boolean;
};
