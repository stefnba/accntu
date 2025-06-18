'use client';
import { authClient } from '@/lib/auth/client/client';
// import { LoginForm } from '@/features/auth/components/login-form';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/client';

export default function LoginStatusPage() {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const { isAuthenticated, authState, user, signIn, signOut, isLoading } = useAuth();

    const { email } = authClient.signUp;

    // const initiateSignInWithEmailOTP = signIn.email.initiate;
    // const initiateSignInWithSocial = signIn.social;

    const signUp = async () => {
        const res = await email({
            email: 'adsfasdfasdf@test.com',
            password: 'password',
            name: 'test',
        });
        console.log(res);
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-muted">
            <div>Auth State</div>
            <div>{JSON.stringify(authState)}</div>
            <div>Is Authenticated</div>
            <div>{JSON.stringify(isAuthenticated)}</div>

            {/* {JSON.stringify(user)} */}
            <div>Session</div>
            <div>{JSON.stringify(user || 'no user')}</div>

            <div>Is Loading</div>
            <div>{JSON.stringify(isLoading)}</div>

            <Button disabled={isLoading} onClick={signUp}>
                Sign Up
            </Button>

            <Button
                disabled={isLoading || isAuthenticated}
                onClick={() =>
                    signIn.email({
                        email: 'adsfasdfasdf@test.com',
                        password: 'password',
                    })
                }
            >
                Sign In with Email
            </Button>
            <Button disabled={isLoading || isAuthenticated} onClick={() => signIn.social('github')}>
                Sign In with Github
            </Button>
            <Button
                disabled={isLoading || isAuthenticated}
                onClick={() => signIn.emailOTP.initiate('stefam@adsf.com')}
            >
                Sign In with Email OTP
            </Button>
            <Button disabled={isLoading || !isAuthenticated} onClick={signOut}>
                Sign Out
            </Button>
        </div>
    );
}
