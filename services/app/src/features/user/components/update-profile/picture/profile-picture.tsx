import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUser } from '@/features/auth/server/next';

import { UpdateUserImageTrigger } from './modal-trigger';

export const UpdateUserImageSection = async () => {
    const user = await getUser();

    return (
        <div className="w-28 text-center">
            <Avatar className="size-28">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback></AvatarFallback>
            </Avatar>

            <UpdateUserImageTrigger />
        </div>
    );
};
