'use client';

import { Spinner } from '@/components/ui/spinner';
import { SocialProvider } from '@/features/auth/schemas';
import { useState } from 'react';

// Provider-specific configuration
const providerConfig: Record<SocialProvider, { name: string; icon: string }> = {
    github: {
        name: 'GitHub',
        icon: '🔗',
    },
    google: {
        name: 'Google',
        icon: '🔍',
    },
    apple: {
        name: 'Apple',
        icon: '🍎',
    },
};

interface OAuthCallbackContentProps {
    provider: SocialProvider;
    error?: string | null;
}

export function OAuthCallbackContent({ provider, error }: OAuthCallbackContentProps) {
    const [errorMessage] = useState<string | null>(error || null);

    if (errorMessage) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-red-500 mb-4">{errorMessage}</div>
                <div>Redirecting to login page...</div>
            </div>
        );
    }

    const providerName = providerConfig[provider].name;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Spinner size="lg" />
            <h2 className="mt-4 text-xl font-semibold">Verifying your {providerName} login...</h2>
            <p className="mt-2 text-gray-500">
                Please wait while we complete the authentication process.
            </p>
        </div>
    );
}

// Type guard to check if a string is a valid provider
export function isValidProvider(provider: string | null): provider is SocialProvider {
    return (
        provider !== null &&
        (provider === 'github' || provider === 'google' || provider === 'apple')
    );
}
