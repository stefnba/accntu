'use client';

import { useGetConnectedBanks } from '../api/get-connected-banks';
import { ConnectedBankCard } from './connected-bank-card';

export const ListConnectedBanks = () => {
    const { data, isLoading } = useGetConnectedBanks();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-4">
            {data?.map((a) => <ConnectedBankCard account={a} key={a.id} />)}
        </div>
    );
};
