import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUser } from '@/lib/auth';

import SectionModal from '../modal';
import PictureUpdateForm from './form';

const PictureSection = async () => {
    const user = await getUser();

    return (
        <div className="mb-8 w-32 text-center ">
            <Avatar className="h-32 w-32">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback></AvatarFallback>
            </Avatar>

            <SectionModal
                className="mt-3 text-primary"
                title="Update your Picture"
                formComponent={PictureUpdateForm}
            />
        </div>
    );
};

export default PictureSection;
