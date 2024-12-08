export const SESSION_COOKIE = {
    COOKIE_NAME: 'session:token',
    EXPIRATION: 60 * 60 * 24 * 30, // 30 days, defined in minutes
    REFRESH: 60 * 60 * 24 * 15 // 15 days, defined in minutes
};

/**
 * Cookie to save public user info that is accessible on frontend through <SessionProvier />
 */
export const SESSION_USER = {
    COOKIE_NAME: 'session:user',
    EXPIRATION: SESSION_COOKIE.EXPIRATION
};

/**
 * The name of the cookie that stores the login token used to identify a login attempt.
 */
export const LOGIN_ATTEMPT_COOKIE_NAME = 'login_attempt_token';

/**
 * Email OTP login.
 */
export const EMAIL_OTP_LOGIN = {
    COOKIE_NAME: 'email_otp_login',
    EXPIRATION: 15, // minutes
    CODE_LENGTH: 8
};

/**
 * API routes that are accessible to the public and don't require authentication.
 */
export const PUBLIC_API_ROUTES = ['/api/auth/**'];

export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
