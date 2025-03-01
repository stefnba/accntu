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

    return otp;
};
