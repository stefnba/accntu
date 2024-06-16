import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { FormSubmit } from '.';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';

interface Props {
    showClose?: boolean;
    form: UseFormReturn<any>;
    setOpen: Dispatch<SetStateAction<boolean>>;
    submitText?: string;
    submitLoadingText?: string;
}

/**
 * Modal Footer with action buttons for form submission.
 */
const FormModalSubmit: React.FC<Props> = ({
    setOpen,
    form,
    showClose = true
}) => {
    return (
        <DialogFooter className="pt-6">
            {showClose && (
                <Button
                    onClick={() => setOpen(false)}
                    type="button"
                    variant="secondary"
                >
                    Close
                </Button>
            )}

            <FormSubmit form={form}>Submit</FormSubmit>
        </DialogFooter>
    );
};

export default FormModalSubmit;
