import {
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@components/ui/dialog';
import { useSession } from '@features/auth/hooks/session';

import { UpdateNameForm } from './form';

interface Props {}

export const UpdateProfileNameModalContent: React.FC<Props> = ({}) => {
    const { user } = useSession();

    if (!user) {
        return <div>No User</div>;
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Edit Name</DialogTitle>
                <DialogDescription>
                    Make changes to your first and last name.
                </DialogDescription>
            </DialogHeader>
            <div className="mx-1">
                <UpdateNameForm
                    firstName={user.firstName}
                    lastName={user.lastName}
                />
            </div>
        </>
    );
};
