import { AuthForm } from './auth-form';

export function SignupForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    return <AuthForm mode="signup" className={className} {...props} />;
}
