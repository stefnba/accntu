'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/lib/auth/client';
import { TSession, TUser } from '@/lib/auth/client/client';
import { useAuthStore } from '@/lib/auth/client/store';
import { useEffect, useState } from 'react';

type ProtectedRouteProps = {
    children: React.ReactNode;
    initialSession: {
        session: TSession;
        user: TUser;
    } | null;
    redirectTo?: string;
};

export const ProtectedRoute = ({
    children,
    initialSession,
    redirectTo = '/login',
}: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuth();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        console.log('mounted');
    }, []);

    useEffect(() => {
        console.log('initialSession changed in ProtectedRoute', initialSession);
        // set the auth state if initialSession is provided
        if (initialSession) {
            console.log('setting authStore in ProtectedRoute', initialSession);
            setAuth(initialSession);
        }
    }, [initialSession]);

    if (!isMounted) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // if (!isAuthenticated) {
    //     redirect(redirectTo);
    // }
    return <>{children}</>;
};
