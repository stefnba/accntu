import { bank, bankUploadAccount } from '@db/schema';
import { InferInsertModel } from 'drizzle-orm';

export type TSeedBanks = Array<
    InferInsertModel<typeof bank> & {
        accounts: Omit<InferInsertModel<typeof bankUploadAccount>, 'bankId'>[];
    }
>;
