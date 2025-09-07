import { createId } from '@paralleldrive/cuid2';
import {
    char,
    date,
    index,
    numeric,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';

export const transactionFxRate = pgTable(
    'transaction_fx_rate',
    {
        id: text()
            .primaryKey()
            .notNull()
            .$defaultFn(() => createId()),
        baseCurrency: char({ length: 3 }).notNull(),
        targetCurrency: char({ length: 3 }).notNull(),
        exchangeRate: numeric({ precision: 18, scale: 8 }).notNull(),
        date: date().notNull(),
        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('fx_rate_currency_date_unique').on(
            table.baseCurrency,
            table.targetCurrency,
            table.date
        ),
        index('fx_rate_date_idx').on(table.date),
        index('fx_rate_currencies_idx').on(table.baseCurrency, table.targetCurrency),
    ]
);
