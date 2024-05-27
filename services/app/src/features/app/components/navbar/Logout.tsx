'use client';

import { useRouter } from 'next/navigation';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const Logout = () => {
    const router = useRouter();

    return (
        <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push('/logout')}
        >
            Logout
        </DropdownMenuItem>
    );
};

export default Logout;
