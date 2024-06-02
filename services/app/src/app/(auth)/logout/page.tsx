'use client';

import { useLogout } from '@/features/auth/api/logout';
import { useEffect } from 'react';

const Logout = () => {
    const { mutate } = useLogout();

    useEffect(() => {
        mutate();
    }, [mutate]);
    return <div>Loging out...</div>;
};

export default Logout;
