import { github } from '@/auth/actions/oauth';

export async function GET(): Promise<Response> {
    return await github.login();
}
