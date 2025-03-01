'use client';

import { useAuth } from '@/hooks';
import { useEffect, useState } from 'react';

type ProtectedRouteProps = {
    children: React.ReactNode;
    redirectTo?: string;
};

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle client-side redirect
    useEffect(() => {
        if (mounted && !isLoading && !isAuthenticated) {
            window.location.href = redirectTo;
        }
    }, [isAuthenticated, isLoading, redirectTo, mounted]);

    // Show nothing while checking authentication
    if (isLoading || !mounted) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // If authenticated, show the children
    return isAuthenticated ? <>{children}</> : null;
}
