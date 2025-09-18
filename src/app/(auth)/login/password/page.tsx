import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginPasswordForm } from '@/features/auth/components/forms/login-password-form';
import { auth } from '@/lib/auth/config';

export default function LoginPasswordPage() {
    const isEmailAndPasswordEnabled = auth.options.emailAndPassword.enabled;

    if (!isEmailAndPasswordEnabled) {
        return <div>Email and password login is not enabled</div>;
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-muted">
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login with Email and Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <LoginPasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
