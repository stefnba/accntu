import { EMAIL_OTP_LOGIN } from '@auth/config';
import { minimatch } from 'minimatch';
import { alphabet, generateRandomString } from 'oslo/crypto';

/**
 * Generate a random string of numbers that can be used as an email OTP.
 */
export const generateEmailOTP = () => {
    return generateRandomString(EMAIL_OTP_LOGIN.CODE_LENGTH, alphabet('0-9'));
};

/**
 * Check if a URL matches any of the patterns.
 * @param url url to check.
 * @param patterns url patterns to match.
 * @returns true if the URL matches any of the patterns.
 */
export const isUrlMatch = (path: string, patterns: string[]): boolean => {
    return patterns.some((pattern) => minimatch(path, pattern));
};
