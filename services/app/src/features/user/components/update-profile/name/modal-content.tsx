import {
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

import { UpdateNameForm } from './form';

interface Props {
    firstName: string;
    lastName: string;
}

export const UpdateProfileNameModalContent: React.FC<Props> = ({
    firstName,
    lastName
}) => {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Edit Name</DialogTitle>
                <DialogDescription>
                    Make changes to your first and last name.
                </DialogDescription>
            </DialogHeader>
            <div className="mx-1">
                <UpdateNameForm firstName={firstName} lastName={lastName} />
            </div>
        </>
    );
};
