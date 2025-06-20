import crypto from 'crypto';

/**
 * Compute the SHA256 hash of a file.
 */
export const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle?.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Create a random file name using crypt library.
 */
export const generateRandonFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
