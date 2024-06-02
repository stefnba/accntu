import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUser } from '@auth/next';

import { UpdateUserImageTrigger } from './update-image-trigger';

export const UpdateUserImageSection = async () => {
    const user = await getUser();

    return (
        <div className="mb-8 w-32 text-center ">
            <Avatar className="h-32 w-32">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback></AvatarFallback>
            </Avatar>
            <UpdateUserImageTrigger />
        </div>
    );
};
