import Link from 'next/link';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Lock, Settings, User } from 'lucide-react';

import { DropdownMenuUser } from './dropdown-menu-user';
import { LogoutButton } from './logout-button';
import { NavbarUserImage } from './user-image';

const NavbarMenu = async () => {
    return (
        <div className="ml-auto">
            <div className=" flex items-center gap-x-5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="b-0 relative rounded-full focus:outline-none">
                            <NavbarUserImage />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel inset className="p-0 font-normal">
                            <DropdownMenuUser />
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/account">
                                    <Settings />
                                    Account Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/account/profile">
                                    <User />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/account/security">
                                    <Lock />
                                    Security
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <LogoutButton />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default NavbarMenu;
