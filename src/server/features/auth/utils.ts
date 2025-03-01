import { createHash, randomBytes } from 'crypto';

/**
 * Generate a random OTP code of specified length
 * @param length Length of the OTP code (default: 6)
 * @returns OTP code
 */
export const generateOTP = (length: number = 6): string => {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    console.log('Generating OTP', otp);

    return otp;
};

/**
 * Generate a secure random token
 * @param length Length of the token in bytes (default: 32)
 * @returns Secure random token as hex string
 */
export const generateSecureToken = (length: number = 32): string => {
    return randomBytes(length).toString('hex');
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
