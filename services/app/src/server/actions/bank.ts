import { db } from '@db';
import { z } from 'zod';

export const GetBanksSchema = z.object({
    country: z.string().optional(),
    name: z.string().optional()
});

/**
 * List all available banks with filters for country and name of bank.
 */
export const getBanks = async ({
    country,
    name
}: z.infer<typeof GetBanksSchema>) => {
    const data = await db.query.bank.findMany({
        with: { accounts: true },
        where: (fields, { eq, and, like }) =>
            and(
                country ? eq(fields.country, country) : undefined,
                name ? like(fields.name, name) : undefined
            )
    });

    return data;
};

export const GetBankSchema = z.object({
    id: z.string()
});

/**
 * Retrieve a single bank by id.
 */
export const getBank = async ({ id }: z.infer<typeof GetBankSchema>) => {
    const data = await db.query.bank.findFirst({
        where: (fields, { eq, and }) => and(eq(fields.id, id)),
        with: {
            accounts: {
                columns: {
                    id: true,
                    type: true
                }
            }
        }
    });

    return data;
};

export const GetAccountByBankSchema = z.object({
    bankId: z.string()
});

/**
 * List all upload accounts types (current, creditcard, etc.) for a given bankId.
 */
export const getAccountsByBankId = async ({
    bankId
}: z.infer<typeof GetAccountByBankSchema>) => {
    const data = await db.query.bankUploadAccount.findMany({
        where: (fields, { and, eq }) => and(eq(fields.bankId, bankId))
    });

    return data;
};
