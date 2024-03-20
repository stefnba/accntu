import { createSessionAndRedirect } from '@/lib/auth';

export async function GET(request: Request): Promise<Response> {
    return await createSessionAndRedirect('asdfskdfk');
}
