import { createHash } from 'crypto';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { alphabet, generateRandomString } from 'oslo/crypto';

// Default OTP configuration
const OTP_CONFIG = {
    CODE_LENGTH: 8,
    EXPIRES_IN: 10 * 60, // 10 minutes in seconds
    MAX_ATTEMPTS: 3,
};

/**
 * Generate a random numeric OTP code
 * @param length Length of the OTP code (default: 6)
 * @returns OTP code
 */
export const generateOTP = (length: number = OTP_CONFIG.CODE_LENGTH): string => {
    const code = generateRandomString(length, alphabet('0-9'));
    console.log('Generating OTP', code);
    return code;
};

/**
 * Hash an OTP code using SHA-256
 * @param otp OTP code to hash
 * @param salt Salt to use for hashing (optional)
 * @returns Hashed OTP
 */
export const hashOTP = (otp: string, salt?: string): string => {
    const hash = createHash('sha256');
    hash.update(otp);

    if (salt) {
        hash.update(salt);
    }

    return hash.digest('hex');
};

/**
 * Verify an OTP against a hash
 * @param otp OTP code to verify
 * @param hash Hash to verify against
 * @param salt Salt used for hashing (optional)
 * @returns Whether the OTP is valid
 */
export const verifyOTP = (otp: string, hash: string, salt?: string): boolean => {
    const computedHash = hashOTP(otp, salt);
    return computedHash === hash;
};

/**
 * Generate a secure random token
 * @param length Length of the token in bytes (default: 32)
 * @returns Secure random token as hex string
 */
export const generateSecureToken = (length: number = 32): string => {
    return generateRandomString(length * 2, alphabet('a-z', 'A-Z', '0-9'));
};

/**
 * Get the user object from the Hono context.
 * @param c Hono context.
 * @returns User object.
 */
export const getUser = (c: Context) => {
    const user = c.get('user');

    if (!user) {
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    return user;
};
