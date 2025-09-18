import { AuthForm } from './auth-form';

export function LoginForm({
    className,
    isEmailAndPasswordEnabled,
    ...props
}: React.ComponentPropsWithoutRef<'div'> & { isEmailAndPasswordEnabled: boolean }) {
    return (
        <AuthForm
            mode="login"
            className={className}
            isEmailAndPasswordEnabled={isEmailAndPasswordEnabled}
            {...props}
        />
    );
}
