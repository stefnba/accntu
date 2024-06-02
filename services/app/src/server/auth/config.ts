export const AUTH_COOKIE_NAME = 'auth_session';

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
