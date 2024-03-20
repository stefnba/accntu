import { redirect } from 'next/navigation';

export default async function Login() {
    return redirect('/api/auth/logout');
}
