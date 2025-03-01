export const AUTH_COOKIE_NAME = 'auth_session';
export const COOKIE_OPTIONS = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict' as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
};
