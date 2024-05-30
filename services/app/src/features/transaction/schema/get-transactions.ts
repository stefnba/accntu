import { FilterTransactionSchema } from './table-filtering';
import { PaginationTransactionSchema } from './table-pagination';
import { TransactionOrderBySchema } from './table-sorting';

export const ListTransactionSchema = FilterTransactionSchema.and(
    PaginationTransactionSchema
).and(TransactionOrderBySchema);
