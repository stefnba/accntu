'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface IFile {
    id: string;
    filename: string | null;
    url: string;
}

interface Props {
    files: IFile[];
    importId: string;
}

interface IParsedTransaction {
    date: string;
    key: string;
    title: string;
    spending_amount: number;
    spending_currency: string;
    account_amount: number;
    account_currency: string;
    is_duplicate: boolean;
}

type TQueryReturnData = Record<string, IParsedTransaction[]>;

const PARSING_SERVER = 'http://localhost:8000';

const getParsedTransactions = async (files: IFile[]) => {
    const res = await fetch(PARSING_SERVER + '/parse', {
        method: 'POST',
        body: JSON.stringify({
            files: files.map((f) => ({ id: f.id, url: f.url })),
            user_id: '123',
            parser_id: 'BARCLAYS_DE_CREDITCARD'
        })
    });
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
};

export const TransactionSelection: React.FC<Props> = ({ files, importId }) => {
    const { data, isLoading } = useQuery<TQueryReturnData>({
        queryKey: ['newImport', importId],
        queryFn: () => getParsedTransactions(files)
    });

    const [fileId, setFileId] = useState<string>(files[0].id);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (data) {
        const transactions = data[fileId];
        return (
            <div>
                {transactions.map((t) => (
                    <div key={t.key}>
                        {t.date} {t.title} {t.spending_amount}{' '}
                        {t.spending_currency} {t.is_duplicate}
                    </div>
                ))}
            </div>
        );
    }
};
