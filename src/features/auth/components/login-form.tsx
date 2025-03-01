import { AuthForm } from './auth-form';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    return <AuthForm mode="login" className={className} {...props} />;
}
