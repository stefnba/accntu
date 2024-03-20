'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { oauth } from '@/auth';
import { generateState } from 'arctic';

const { github } = oauth;

export async function loginGitHub() {
    const state = generateState();
    const url = await github.provider.createAuthorizationURL(state, {
        scopes: ['user:email']
    });

    cookies().set(github.cookieName, state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax'
    });

    return redirect(url.toString());
}
