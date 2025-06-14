import { and, eq } from 'drizzle-orm';
import { db } from '../../../../server/db';
import {
    connectedBank,
    connectedBankAccount,
    globalBank,
    globalBankAccount,
    type ConnectedBank,
    type ConnectedBankAccount,
    type GlobalBank,
    type GlobalBankAccount,
} from './schema';

/**
 * Get all global banks
 * @returns All global banks
 */
export const getAllGlobalBanks = async (): Promise<GlobalBank[]> => {
    return await db.select().from(globalBank).where(eq(globalBank.isActive, true));
};

/**
 * Get a global bank by id
 * @param id - The id of the global bank
 * @returns The global bank
 */
export const getGlobalBankById = async (id: string): Promise<GlobalBank | null> => {
    const result = await db.select().from(globalBank).where(eq(globalBank.id, id)).limit(1);
    return result[0] || null;
};

/**
 * Get all global banks by country
 * @param country - The country of the global banks
 * @returns All global banks by country
 */
export const getGlobalBanksByCountry = async (country: string): Promise<GlobalBank[]> => {
    return await db
        .select()
        .from(globalBank)
        .where(and(eq(globalBank.country, country), eq(globalBank.isActive, true)));
};

/**
 * Get all global bank accounts by bank id
 * @param globalBankId - The id of the global bank
 * @returns All global bank accounts by bank id
 */
export const getGlobalBankAccountsByBankId = async (
    globalBankId: string
): Promise<GlobalBankAccount[]> => {
    return await db
        .select()
        .from(globalBankAccount)
        .where(
            and(
                eq(globalBankAccount.globalBankId, globalBankId),
                eq(globalBankAccount.isActive, true)
            )
        );
};

/**
 * Get a global bank account by id
 * @param id - The id of the global bank account
 * @returns The global bank account
 */
export const getGlobalBankAccountById = async (id: string): Promise<GlobalBankAccount | null> => {
    const result = await db
        .select()
        .from(globalBankAccount)
        .where(eq(globalBankAccount.id, id))
        .limit(1);
    return result[0] || null;
};

/**
 * Get all connected banks by user id
 * @param userId - The id of the user
 * @returns All connected banks by user id
 */
export const getConnectedBanksByUserId = async (userId: string): Promise<ConnectedBank[]> => {
    return await db
        .select()
        .from(connectedBank)
        .where(and(eq(connectedBank.userId, userId), eq(connectedBank.isActive, true)));
};

/**
 * Get a connected bank by id
 * @param id - The id of the connected bank
 * @returns The connected bank
 */
export const getConnectedBankById = async (id: string): Promise<ConnectedBank | null> => {
    const result = await db.select().from(connectedBank).where(eq(connectedBank.id, id)).limit(1);
    return result[0] || null;
};

/**
 * Create a connected bank
 * @param data - The data to create the connected bank
 * @returns The created connected bank
 */
export const createConnectedBank = async (data: {
    userId: string;
    globalBankId: string;
    apiCredentials?: any;
}): Promise<ConnectedBank> => {
    const result = await db.insert(connectedBank).values(data).returning();
    return result[0];
};

/**
 * Get all connected bank accounts by user id
 * @param userId - The id of the user
 * @returns All connected bank accounts by user id
 */
export const getConnectedBankAccountsByUserId = async (
    userId: string
): Promise<ConnectedBankAccount[]> => {
    const result = await db
        .select({
            id: connectedBankAccount.id,
            connectedBankId: connectedBankAccount.connectedBankId,
            globalBankAccountId: connectedBankAccount.globalBankAccountId,
            name: connectedBankAccount.name,
            description: connectedBankAccount.description,
            type: connectedBankAccount.type,
            accountNumber: connectedBankAccount.accountNumber,
            iban: connectedBankAccount.iban,
            routingNumber: connectedBankAccount.routingNumber,
            currentBalance: connectedBankAccount.currentBalance,
            availableBalance: connectedBankAccount.availableBalance,
            creditLimit: connectedBankAccount.creditLimit,
            currency: connectedBankAccount.currency,
            providerAccountId: connectedBankAccount.providerAccountId,
            customCsvConfig: connectedBankAccount.customCsvConfig,
            status: connectedBankAccount.status,
            isActive: connectedBankAccount.isActive,
            createdAt: connectedBankAccount.createdAt,
            updatedAt: connectedBankAccount.updatedAt,
        })
        .from(connectedBankAccount)
        .innerJoin(connectedBank, eq(connectedBankAccount.connectedBankId, connectedBank.id))
        .where(and(eq(connectedBank.userId, userId), eq(connectedBankAccount.isActive, true)));

    return result;
};

/**
 * Get all connected bank accounts by connected bank id
 * @param connectedBankId - The id of the connected bank
 * @returns All connected bank accounts by connected bank id
 */
export const getConnectedBankAccountsByConnectedBankId = async (
    connectedBankId: string
): Promise<ConnectedBankAccount[]> => {
    return await db
        .select()
        .from(connectedBankAccount)
        .where(
            and(
                eq(connectedBankAccount.connectedBankId, connectedBankId),
                eq(connectedBankAccount.isActive, true)
            )
        );
};

/**
 * Get a connected bank account by id
 * @param id - The id of the connected bank account
 * @returns The connected bank account
 */
export const getConnectedBankAccountById = async (
    id: string
): Promise<ConnectedBankAccount | null> => {
    const result = await db
        .select()
        .from(connectedBankAccount)
        .where(eq(connectedBankAccount.id, id))
        .limit(1);
    return result[0] || null;
};

/**
 * Create a connected bank account
 * @param data - The data to create the connected bank account
 * @returns The created connected bank account
 */
export const createConnectedBankAccount = async (data: {
    connectedBankId: string;
    globalBankAccountId?: string;
    name: string;
    type: 'checking' | 'savings' | 'credit_card' | 'investment';
    accountNumber?: string;
    iban?: string;
    routingNumber?: string;
    currency?: string;
    customCsvConfig?: any;
}): Promise<ConnectedBankAccount> => {
    const result = await db.insert(connectedBankAccount).values(data).returning();
    return result[0];
};

/**
 * Update a connected bank account
 * @param id - The id of the connected bank account
 * @param data - The data to update the connected bank account
 * @returns The updated connected bank account
 */
export const updateConnectedBankAccount = async (
    id: string,
    data: Partial<ConnectedBankAccount>
): Promise<ConnectedBankAccount | null> => {
    const result = await db
        .update(connectedBankAccount)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(connectedBankAccount.id, id))
        .returning();
    return result[0] || null;
};

/**
 * Search for global banks
 * @param query - The query to search for
 * @param country - The country to search for
 * @returns The global banks
 */
export const searchGlobalBanks = async (query: string, country?: string): Promise<GlobalBank[]> => {
    let whereClause = and(
        eq(globalBank.isActive, true)
        // Add text search when available in your database
        // ilike(globalBank.name, `%${query}%`)
    );

    if (country) {
        whereClause = and(whereClause, eq(globalBank.country, country));
    }

    return await db.select().from(globalBank).where(whereClause);
};

// CSV Parsing queries
export const getGlobalBankAccountWithCsvConfig = async (
    id: string
): Promise<GlobalBankAccount | null> => {
    const result = await db
        .select()
        .from(globalBankAccount)
        .where(eq(globalBankAccount.id, id))
        .limit(1);
    return result[0] || null;
};

export const getConnectedBankAccountWithCsvConfig = async (
    id: string
): Promise<(ConnectedBankAccount & { globalBankAccount?: GlobalBankAccount }) | null> => {
    const result = await db
        .select({
            // ConnectedBankAccount fields
            id: connectedBankAccount.id,
            connectedBankId: connectedBankAccount.connectedBankId,
            globalBankAccountId: connectedBankAccount.globalBankAccountId,
            name: connectedBankAccount.name,
            description: connectedBankAccount.description,
            type: connectedBankAccount.type,
            accountNumber: connectedBankAccount.accountNumber,
            iban: connectedBankAccount.iban,
            routingNumber: connectedBankAccount.routingNumber,
            currentBalance: connectedBankAccount.currentBalance,
            availableBalance: connectedBankAccount.availableBalance,
            creditLimit: connectedBankAccount.creditLimit,
            currency: connectedBankAccount.currency,
            providerAccountId: connectedBankAccount.providerAccountId,
            customCsvConfig: connectedBankAccount.customCsvConfig,
            status: connectedBankAccount.status,
            isActive: connectedBankAccount.isActive,
            createdAt: connectedBankAccount.createdAt,
            updatedAt: connectedBankAccount.updatedAt,
            // GlobalBankAccount fields (prefixed to avoid conflicts)
            globalBankAccountData: {
                id: globalBankAccount.id,
                globalBankId: globalBankAccount.globalBankId,
                type: globalBankAccount.type,
                name: globalBankAccount.name,
                description: globalBankAccount.description,
                transformQuery: globalBankAccount.transformQuery,
                csvConfig: globalBankAccount.csvConfig,
                sampleCsvData: globalBankAccount.sampleCsvData,
                isActive: globalBankAccount.isActive,
                createdAt: globalBankAccount.createdAt,
                updatedAt: globalBankAccount.updatedAt,
            },
        })
        .from(connectedBankAccount)
        .leftJoin(
            globalBankAccount,
            eq(connectedBankAccount.globalBankAccountId, globalBankAccount.id)
        )
        .where(eq(connectedBankAccount.id, id))
        .limit(1);

    if (!result[0]) return null;

    const account = result[0];
    return {
        id: account.id,
        connectedBankId: account.connectedBankId,
        globalBankAccountId: account.globalBankAccountId,
        name: account.name,
        description: account.description,
        type: account.type,
        accountNumber: account.accountNumber,
        iban: account.iban,
        routingNumber: account.routingNumber,
        currentBalance: account.currentBalance,
        availableBalance: account.availableBalance,
        creditLimit: account.creditLimit,
        currency: account.currency,
        providerAccountId: account.providerAccountId,
        customCsvConfig: account.customCsvConfig,
        status: account.status,
        isActive: account.isActive,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        globalBankAccount: account.globalBankAccountData?.id
            ? account.globalBankAccountData
            : undefined,
    };
};
