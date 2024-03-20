import logout from '@/actions/auth/logout';
import { authRoutes } from '@/lib/auth';

export async function GET(): Promise<Response> {
    await logout();

    return Response.redirect(authRoutes.LOGIN_URL);
}
