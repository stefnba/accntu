import { LoginForm } from '@/features/auth/components/forms/login-form';
import { auth } from '@/lib/auth/config';

export default function LoginPage() {
    const isEmailAndPasswordEnabled = auth.options.emailAndPassword.enabled;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-muted">
            <div className="w-full max-w-sm">
                <LoginForm isEmailAndPasswordEnabled={isEmailAndPasswordEnabled} />
            </div>
        </div>
    );
}
