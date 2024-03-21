import { cookies } from 'next/headers';

export const setSecureCookie = (name: string, value: any, lifetime: number) => {
    cookies().set(name, value, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * lifetime,
        sameSite: 'lax'
    });
};
