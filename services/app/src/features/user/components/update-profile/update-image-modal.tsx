import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { storeUpdateUserImageModal } from '@/features/user/store/update-user-image-modal';

import { UpdateUserImageForm } from './update-image-form';

interface Props {}

export const UpdateUserImageModal: React.FC<Props> = ({}) => {
    const { isOpen, handleClose } = storeUpdateUserImageModal();
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>Upload a new Profile Picture</DialogTitle>
                    <DialogDescription>
                        Drag & Drop a Image File or Click to open the File
                        Explorer
                    </DialogDescription>
                </DialogHeader>
                <UpdateUserImageForm />
            </DialogContent>
        </Dialog>
    );
};
