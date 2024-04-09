'use client';

import { useEffect, useState } from 'react';

interface Props {
    files: {
        id: string;
        filename: string | null;
        url: string;
    }[];
}

const PARSING_SERVER = 'http://localhost:8000';

const useFetch = (url: string, options: RequestInit) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>();

    useEffect(() => {
        setIsLoading(true);
        fetch(url, options)
            .then((res) => {
                if (!res.ok) {
                    setError(res.statusText);
                }

                if (res.ok) {
                    setData(res.json());
                }
            })
            .catch((err) => {
                console.error(err);
            });
    });

    return { isLoading, data, error };
};

export const TransactionSelection: React.FC<Props> = ({ files }) => {
    // const { isLoading, data, error } = useFetch(PARSING_SERVER + '/parse', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         files: files.map((f) => ({ id: f.id, url: f.url })),
    //         user_id: '123',
    //         parser_id: 'BARCLAYS_DE_CREDITCARD'
    //     })
    // });

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    // useEffect(() => {
    //     fetch(PARSING_SERVER + '/parse', {
    //         method: 'POST',
    //         body: JSON.stringify({
    //             files: files.map((f) => ({ id: f.id, url: f.url })),
    //             user_id: '123',
    //             parser_id: 'BARCLAYS_DE_CREDITCARD'
    //         })
    //     })
    //         .then((res) => {
    //             if (!res.ok) {
    //             }

    //             return res.json();
    //         })
    //         .catch((err) => {
    //             console.error(err);
    //         });
    // }, [files]);

    return <></>;
};
