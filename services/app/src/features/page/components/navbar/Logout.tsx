'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useLogout } from '@/features/auth/api/logout';
import { LogOut } from 'lucide-react';

const Logout = () => {
    const { mutate } = useLogout();

    return (
        <DropdownMenuItem onClick={() => mutate()}>
            <LogOut />
            Logout
        </DropdownMenuItem>
    );
};

export default Logout;
