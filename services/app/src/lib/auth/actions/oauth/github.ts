'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { userActions } from '@/actions';
import { createSessionAndRedirect, oauth } from '@/auth';
import { db, schema as dbSchema } from '@/db';
import { generateState } from 'arctic';

import { GitHubEmail, GitHubUser } from './types';

const { github: GitHubOauth } = oauth;

/**
 * Redirect the user to the GitHub OAuth page.
 */
export async function login() {
    const state = generateState();
    const url = await GitHubOauth.provider.createAuthorizationURL(state, {
        scopes: ['user:email']
    });

    cookies().set(GitHubOauth.cookieName, state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax'
    });

    return redirect(url.toString());
}

/**
 * Callback to verify the GitHub OAuth response.
 */
export async function verify(code?: string | null, state?: string | null) {
    const storedState = cookies().get(GitHubOauth.cookieName)?.value ?? null;

    cookies().delete(GitHubOauth.cookieName);

    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400
        });
    }

    const tokens = await GitHubOauth.provider.validateAuthorizationCode(code);
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

    const existingUser = await db.query.oauthAccount.findFirst({
        where: (fields, { eq, and }) =>
            and(
                eq(fields.providerUserId, providerUserId),
                eq(fields.provider, GitHubOauth.providerId)
            )
    });

    // user already authenticated with github
    if (existingUser) {
        return await createSessionAndRedirect(existingUser.userId);
    }

    const user = await userActions.create({
        email: primaryEmail,
        firstName: githubUser.name,
        image: githubUser.image
    });

    await db.insert(dbSchema.oauthAccount).values({
        provider: GitHubOauth.providerId,
        providerUserId: providerUserId,
        userId: user.id
    });

    return await createSessionAndRedirect(user.id);
}
