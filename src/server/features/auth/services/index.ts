/**
 * Auth feature services index
 * Exports all service modules with namespaced aliases to avoid naming conflicts
 */

// Core auth services
export * as sessionServices from './session';
export * as verificationServices from './verification';

// Auth method specific services
export * as emailOtpServices from './email-otp';
export * as oauthServices from './oauth';

// Re-export all services as a namespace for convenience
import * as emailOtp from './email-otp';
import * as oauth from './oauth';
import * as session from './session';
import * as verification from './verification';

export const services = {
    session,
    verification,
    emailOtp,
    oauth,
};
