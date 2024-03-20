'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const REDIRECT_URL = '/auth/verify';

export async function loginEmail(email: string) {
    // todo delete all existing tokens for this email

    // todo generate token in db

    // todo send email

    // cookies().set('github_oauth_state', state, {
    //     path: '/',
    //     secure: process.env.NODE_ENV === 'production',
    //     httpOnly: true,
    //     maxAge: 60 * 10,
    //     sameSite: 'lax'
    // });

    return redirect(REDIRECT_URL);
}
