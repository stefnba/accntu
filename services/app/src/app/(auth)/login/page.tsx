import Link from 'next/link';

import { LoginRegisterForm } from '@/features/auth/components/login-register-form';

const Login = async () => {
    return (
        <div className="w-[340px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back!
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to log in.
                </p>
            </div>

            <LoginRegisterForm type="login" />

            <p className="mt-8 px-8 text-center text-sm">
                <span className="text-muted-foreground">
                    If you don&apos;t have an account yet, you can register{' '}
                </span>
                <Link
                    href="/register"
                    className="underline underline-offset-4 hover:text-primary text-primary"
                >
                    here
                </Link>
                .
            </p>
        </div>
    );
};

export default Login;
