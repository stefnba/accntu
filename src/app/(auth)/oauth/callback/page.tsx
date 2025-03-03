'use client';

import { isValidProvider } from '@/features/auth/components/oauth-callback-content';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function OAuthCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const provider = searchParams.get('provider');
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
            router.push('/login?error=no_code');
            return;
        }

        if (isValidProvider(provider)) {
            // Redirect to the provider-specific page using window.location
            // to avoid Next.js router type issues with dynamic routes
            window.location.href = `/oauth/callback/${provider}?code=${code}${state ? `&state=${state}` : ''}`;
        } else {
            router.push('/login?error=invalid_provider');
        }
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="mt-4 text-xl font-semibold">Redirecting...</h2>
        </div>
    );
}
