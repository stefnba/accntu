import { db } from '@/db';

export const getBanks = async (country?: string) => {
    const data = await db.query.bank.findMany({
        where: (fields, { eq, and }) =>
            and(country ? eq(fields.country, country) : undefined)
    });

    return data;
};

export const getBank = async (id: string) => {
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

export const getAccountsByBankId = async (bankId: string) => {
    const data = await db.query.bankUploadAccount.findMany({
        where: (fields, { and, eq }) => and(eq(fields.bankId, bankId))
    });

    return data;
};
