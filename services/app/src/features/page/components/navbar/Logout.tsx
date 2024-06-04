'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useLogout } from '@/features/auth/api/logout';

const Logout = () => {
    const { mutate } = useLogout();

    return (
        <DropdownMenuItem className="cursor-pointer" onClick={() => mutate()}>
            Logout
        </DropdownMenuItem>
    );
};

export default Logout;
