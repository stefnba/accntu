import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuLinkItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getUser } from '@auth/next';
import { LuBell } from 'react-icons/lu';

import Logout from './Logout';

const NavbarMenu = async () => {
    const { firstName, lastName, email, image } = await getUser();

    return (
        <div className="ml-auto">
            <div className=" flex items-center gap-x-5">
                {/* <LuBell className="cursor-pointer hover:text-slate-600" size={20} /> */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="b-0 relative rounded-full focus:outline-none">
                            <Avatar className="size-9">
                                <AvatarImage src={image || ''} alt="@shadcn" />
                                <AvatarFallback>User</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-lg font-medium leading-none">
                                    {firstName} {lastName}
                                </p>
                                <p className="leading-none text-muted-foreground">
                                    {email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuLinkItem href="/account">
                                Account Settings
                            </DropdownMenuLinkItem>
                            <DropdownMenuLinkItem href="/account/profile">
                                Profile
                            </DropdownMenuLinkItem>
                            <DropdownMenuLinkItem href="/account/security">
                                Security
                            </DropdownMenuLinkItem>
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
