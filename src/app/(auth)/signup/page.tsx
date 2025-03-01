import { SignupForm } from '@/features/auth/components/signup-form';

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-muted">
            <div className="w-full max-w-sm">
                <SignupForm />
            </div>
        </div>
    );
}
