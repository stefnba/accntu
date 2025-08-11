/**
 * Generate user display name from profile data
 * @param user - User profile data
 * @returns Display name string
 */
export const generateDisplayName = (user: {
    name?: string | null;
    lastName?: string | null;
    email: string;
}): string => {
    if (user.name && user.lastName) {
        return `${user.name} ${user.lastName}`;
    }

    if (user.name) {
        return user.name;
    }

    return user.email.split('@')[0];
};

/**
 * Generate user initials for avatar fallback
 * @param user - User profile data
 * @returns Initials string (1-2 characters)
 */
export const generateUserInitials = (user: {
    name?: string | null;
    lastName?: string | null;
    email: string;
}): string => {
    if (user.name && user.lastName) {
        return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }

    if (user.name) {
        return user.name.charAt(0).toUpperCase();
    }

    return user.email.charAt(0).toUpperCase();
};

/**
 * Validate user image file
 * @param file - Image file to validate
 * @returns Validation result
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
        return { isValid: false, error: 'File size must be less than 2MB' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    return { isValid: true };
};

/**
 * Get theme-aware avatar background colors
 * @returns CSS classes for avatar background
 */
export const getAvatarColorClasses = (): string => {
    return 'bg-gradient-to-br from-primary/10 to-primary/20 text-primary';
};
