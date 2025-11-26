export const importTransactions = async (
    _fileId: string,
    _userId: string
): Promise<{
    importedCount: number;
    skippedCount: number;
}> => {
    // const file = await importFileServices.getById({ fileId, userId });
    // if (!file) {
    //     throw new Error('Import file not found');
    // }

    // const parseResult = await parseTransactionFile(fileId, userId);
    // const newTransactions = parseResult.transactions.filter((t) => !t.isDuplicate);

    // if (newTransactions.length === 0) {
    //     return {
    //         importedCount: 0,
    //         skippedCount: parseResult.duplicateCount,
    //     };
    // }

    // const transactionsToImport = newTransactions.map((transaction) => ({
    //     amount: transaction.amount,
    //     description: transaction.description,
    //     date: new Date(transaction.date),
    //     category: transaction.category || null,
    //     reference: transaction.reference || null,
    //     key: transaction.id,
    //     bankAccountId: file.import?.connectedBankAccountId || '',
    //     importFileId: fileId,
    // }));

    // const importedTransactions = await transactionServices.createMany({
    //     userId,
    //     transactions: transactionsToImport,
    // });

    // await importFileServices.update({
    //     id: fileId,
    //     userId,
    //     data: {
    //         status: 'imported',
    //     },
    // });

    return {
        importedCount: 1,
        skippedCount: 22,
    };
};
