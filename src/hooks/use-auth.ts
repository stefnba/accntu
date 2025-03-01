'use client';
import { AuthContext } from '@/providers/auth-provider';
import { useContext } from 'react';

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
