import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuLinkItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getUser } from '@/features/auth/server/next';
import {
    BadgeCheck,
    Bell,
    CreditCard,
    Lock,
    LogOut,
    Settings,
    Sparkles,
    User
} from 'lucide-react';

import Logout from './Logout';

const NavbarMenu = async () => {
    const { firstName, lastName, email, image } = await getUser();

    return (
        <div className="ml-auto">
            <div className=" flex items-center gap-x-5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="b-0 relative rounded-full focus:outline-none">
                            <Avatar className="size-9">
                                <AvatarImage src={image || ''} alt="User" />
                                <AvatarFallback>User</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel inset className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    <AvatarImage
                                        src={image || ''}
                                        alt={email}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        CN
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left leading-tight ">
                                    <span className="truncate text font-semibold">
                                        {firstName} {lastName}
                                    </span>
                                    <span className="text-xs truncate text-muted-foreground">
                                        {email}
                                    </span>
                                </div>
                            </div>
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
                        <Logout />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default NavbarMenu;
