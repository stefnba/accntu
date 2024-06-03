import Link from 'next/link';

import { LoadingBouncer } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { useInitGitHubOauth } from '@/features/auth/api/init-github-oauth';
import { IconType } from 'react-icons';
import { AiFillGithub, AiFillLinkedin } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';

interface OAuthProviderProps {
    title: string;
    onClick: () => void;
    icon: IconType;
    isLoading?: boolean;
}

const OAuthProvider = ({
    title,
    onClick,
    icon: Icon,
    isLoading = false
}: OAuthProviderProps) => (
    <Button
        onClick={onClick}
        className="mt-2 w-full text-center"
        variant="outline"
        type="button"
    >
        {isLoading ? (
            <LoadingBouncer />
        ) : (
            <>
                <Icon className="mr-2 h-6 w-6" />
                {title}{' '}
            </>
        )}
        {/* */}
    </Button>
);

const GitHubOAuth = () => {
    const { mutate, isPending } = useInitGitHubOauth();
    return (
        <OAuthProvider
            isLoading={isPending}
            title="GitHub"
            icon={AiFillGithub}
            onClick={() => mutate()}
        />
    );
};

export const OAuthProviders = () => (
    <>
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-100 px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
        </div>
        <GitHubOAuth />
        {/* <OAuthProvider title="Google" icon={FcGoogle} url="/login/google" /> */}
        {/* <OAuthProvider title="LinkedIn" icon={AiFillLinkedin} id="linkedin" /> */}
    </>
);
