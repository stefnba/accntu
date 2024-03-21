'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { authRoutes, getSessionIdFromCookie, lucia } from '@/auth';

export async function logout() {
    const sessionId = getSessionIdFromCookie();

    if (!sessionId) {
        return redirect(authRoutes.LOGIN_URL);
    }

    await lucia.invalidateSession(sessionId);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
    return redirect(authRoutes.LOGIN_URL);
}
