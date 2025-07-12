'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { useSession } from '@/lib/auth/client/session';
import { LOGIN_URL, RoutePath } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type AuthGuardProps = {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: RoutePath;
    requireAuth?: boolean;
};

export function AuthGuard({
    children,
    fallback = <AuthLoadingFallback />,
    redirectTo = LOGIN_URL,
    requireAuth = true,
}: AuthGuardProps) {
    const { isAuthenticated, isLoading, error } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && requireAuth && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

    // Show loading state
    if (isLoading) {
        return <>{fallback}</>;
    }

    // Show error state (optional)
    if (error) {
        console.error('Auth error:', error);
        // You might want to show an error page here
    }

    // Redirect case - don't render children
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    // Render children for:
    // - Authenticated users when requireAuth=true
    // - Any users when requireAuth=false (public routes)
    return <>{children}</>;
}

function AuthLoadingFallback() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner />
        </div>
    );
}

// Convenience wrapper for protected routes
export function ProtectedRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
    return (
        <AuthGuard requireAuth={true} {...props}>
            {children}
        </AuthGuard>
    );
}

// Convenience wrapper for public routes (still checks auth state)
export function PublicRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
    return (
        <AuthGuard requireAuth={false} {...props}>
            {children}
        </AuthGuard>
    );
}
