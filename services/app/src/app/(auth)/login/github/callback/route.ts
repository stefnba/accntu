import { github } from '@/auth/actions/oauth';
import { OAuth2RequestError } from 'arctic';

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    try {
        return await github.verify(code, state);
    } catch (e) {
        console.error(e);

        // the specific error message depends on the provider
        if (e instanceof OAuth2RequestError) {
            // invalid code
            return new Response(null, {
                status: 400
            });
        }
        return new Response(null, {
            status: 500
        });
    }
}
