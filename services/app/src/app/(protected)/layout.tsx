import { redirect } from 'next/navigation';

import { authRoutes, validateRequest } from '@/lib/auth';

interface Props {
    children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: Readonly<Props>) {
    const session = await validateRequest();

    if (!session.session || !session.user) {
        redirect(authRoutes.LOGIN_URL);
    }

    return <div>Here is my Laout{children}</div>;
}
