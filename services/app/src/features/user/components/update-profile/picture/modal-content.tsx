import {
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

import { UpdateUserImageForm } from './form';

interface Props {}

export const UpdateProfilePictureModalContent: React.FC<Props> = ({}) => {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Change Picture</DialogTitle>
                <DialogDescription>
                    Upload a new Profile Picutre. You can drag & drop a Image
                    File or click to open the File Explorer.
                </DialogDescription>
            </DialogHeader>
            <UpdateUserImageForm />
        </>
    );
};
