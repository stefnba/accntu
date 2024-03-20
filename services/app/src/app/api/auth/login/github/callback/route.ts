import { cookies } from 'next/headers';

import { createSessionAndRedirect, oauth } from '@/auth';
import db from '@/db';
import { OAuth2RequestError } from 'arctic';

interface GitHubUser {
    id: string;
    login: string;
    image: string;
    name: string;
}

interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility?: string;
}

const { github: GitHubOauth } = oauth;

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies().get(GitHubOauth.cookieName)?.value ?? null;

    cookies().delete(GitHubOauth.cookieName);

    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400
        });
    }

    try {
        const tokens =
            await GitHubOauth.provider.validateAuthorizationCode(code);
        const headers = {
            Authorization: `Bearer ${tokens.accessToken}`
        };

        const githubUserResponse = await fetch('https://api.github.com/user', {
            headers
        });
        const githubUser: GitHubUser = await githubUserResponse.json();

        const response = await fetch('https://api.github.com/user/emails', {
            headers
        });
        const githubEmail: GitHubEmail[] = await response.json();
        const primaryEmail =
            githubEmail.find((email) => email.primary)?.email ?? null;

        if (!primaryEmail) {
            return new Response(null, {
                status: 400
            });
        }

        const providerUserId = String(githubUser.id);

        const existingUser = await db.oAuthAccount.findFirst({
            where: {
                providerUserId: providerUserId,
                provider: GitHubOauth.providerId
            }
        });

        // user already authenticated with github
        if (existingUser) {
            return await createSessionAndRedirect(existingUser.userId);
        }

        const user = await db.user.create({
            data: {
                email: primaryEmail,
                firstName: githubUser.name,
                image: githubUser.image,
                emailVerifiedAt: new Date()
            }
        });

        await db.oAuthAccount.create({
            data: {
                provider: GitHubOauth.providerId,
                providerUserId: providerUserId,
                userId: user.id
            }
        });

        return await createSessionAndRedirect(user.id);
    } catch (e) {
        console.error(e);

        // the specific error message depends on the provider
        if (e instanceof OAuth2RequestError) {
            // invalid code
            return new Response(null, {
                status: 400
            });
        }
        return new Response(null, {
            status: 500
        });
    }
}
