// 'use client';
// import Link from 'next/link';
// import { loginGitHub } from '@/actions/auth/login/oauth';
// import { Button } from '@/components/ui/button';
// export default function Login() {
//     return (
//         <>
//             <h1>Sign in</h1>
//             <p>
//                 Login here:
//                 <Link href="/login/github">
//                     <Button onClick={() => loginGitHub()}>
//                         Login with Github
//                     </Button>
//                 </Link>
//             </p>
//         </>
//     );
// }
import Link from 'next/link';
import { redirect } from 'next/navigation';

import LoginForm from '../_components/form';

const Login = async () => {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back!
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to log in.
                </p>
            </div>

            <LoginForm type="login" />

            <p className="mt-8 px-8 text-center text-sm text-muted-foreground">
                If you don&apos;t have an account yet, you can register{' '}
                <Link
                    href="/register"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    here
                </Link>
                .
            </p>
        </>
    );
};

export default Login;
