/**
 * Auth feature services index
 * Exports all service modules with namespaced aliases to avoid naming conflicts
 */

// Core auth services
export * as sessionServices from './session';
export * as verificationTokenServices from './verification-token';

// Auth method specific services
export * as emailOtpServices from './email-otp';
export * as oauthServices from './oauth';

// Re-export all services as a namespace for convenience
import * as emailOtp from './email-otp';
import * as oauth from './oauth';
import * as session from './session';
import * as verificationToken from './verification-token';

export const services = {
    session,
    verificationToken,
    emailOtp,
    oauth,
};
