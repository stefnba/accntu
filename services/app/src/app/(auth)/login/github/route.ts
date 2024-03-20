import { NextResponse } from 'next/server';

import { loginGitHub } from '@/actions/auth/login/oauth';

export async function GET(request: Request): Promise<Response> {
    return await loginGitHub();
}
