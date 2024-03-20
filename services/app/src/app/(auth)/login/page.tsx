'use client';

import { loginGitHub } from '@/actions/auth/login/oauth';
import { Button } from '@/components/ui/button';

export default function Login() {
    return (
        <>
            <h1>Sign in</h1>
            {/* <a href="/api/auth/login/github">Sign in with GitHub</a>
             */}

            <p>
                Login here:
                <Button onClick={() => loginGitHub()}>Login</Button>
            </p>
        </>
    );
}
