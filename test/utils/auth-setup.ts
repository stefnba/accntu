import { auth } from '@/lib/auth/config';
import { createId } from '@paralleldrive/cuid2';

export interface TestAuthUser {
    id: string;
    email: string;
}

export interface TestAuthHeaders extends Record<string, string> {
    Cookie: string;
}

export interface TestAuthSetup {
    testUser: TestAuthUser;
    authHeaders: TestAuthHeaders;
}

export const createTestAuth = async (): Promise<TestAuthSetup> => {
    const userId = createId();
    const email = `test-${userId}@example.com`;
    const password = 'password';

    await auth.api.createUser({
        body: {
            email,
            password,
            name: 'Test User',
            role: 'user',
        },
    });

    const resp = await auth.api.signInEmail({
        body: {
            email,
            password,
        },
        asResponse: true,
    });

    if (resp.status !== 200) {
        throw new Error('Failed to sign in during test setup');
    }

    const setCookie = resp.headers.getSetCookie();
    const authCookie = setCookie.find((c) => c.startsWith('auth_session='));
    const cookieValue = authCookie?.split(';')[0];

    if (!cookieValue) {
        throw new Error('Auth session cookie not found');
    }

    const authHeaders = {
        Cookie: cookieValue,
    };

    const testUser = { id: userId, email };

    return { testUser, authHeaders };
};
