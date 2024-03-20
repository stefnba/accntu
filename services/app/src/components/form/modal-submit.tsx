import { Dispatch, SetStateAction } from 'react';
import { DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { FormSubmit } from '.';
import { UseFormReturn } from 'react-hook-form';

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
    showClose = true,
    submitLoadingText = 'Submitting...',
    submitText = 'Submit'
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

            <FormSubmit
                loadingTitle={submitLoadingText}
                title={submitText}
                form={form}
            />
        </DialogFooter>
    );
};

export default FormModalSubmit;
