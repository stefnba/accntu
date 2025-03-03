'use client';

import { OAuthCallbackContent } from '@/features/auth/components/oauth-callback-content';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GitHubCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyOauth } = useAuth();

    useEffect(() => {
        // Automatically add the provider to the search params
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (code) {
            verifyOauth('github', code, state).catch((error) => {
                console.error('GitHub verification error:', error);
                setTimeout(() => router.push('/login?error=github_verification_failed'), 3000);
            });
        } else {
            router.push('/login?error=no_code');
        }
    }, [searchParams, verifyOauth, router]);

    return <OAuthCallbackContent provider="github" />;
}
