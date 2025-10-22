/**
 * Usage Examples for ResponsiveModal (Compound Component Pattern)
 *
 * This file demonstrates various ways to use the new ResponsiveModal component.
 * Delete this file once you've migrated to the new pattern.
 */

import { ResponsiveModal } from '@/components/responsive-modal/responsive-modal';
import { Button } from '@/components/ui/button';

// ============================================
// Example 1: Simple Confirmation Modal
// ============================================

export const SimpleConfirmModal = ({
    open,
    onOpenChange,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) => {
    return (
        <ResponsiveModal open={open} onOpenChange={onOpenChange}>
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>Delete Item</ResponsiveModal.Title>
                <ResponsiveModal.Description>
                    This action cannot be undone. Are you sure?
                </ResponsiveModal.Description>
            </ResponsiveModal.Header>

            <ResponsiveModal.Content>
                <p>This will permanently delete the item from the database.</p>
            </ResponsiveModal.Content>

            <ResponsiveModal.Footer>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                    Delete
                </Button>
            </ResponsiveModal.Footer>
        </ResponsiveModal>
    );
};

// ============================================
// Example 2: Form Modal (No Footer in Modal)
// ============================================

export const FormModal = ({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    return (
        <ResponsiveModal open={open} onOpenChange={onOpenChange}>
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>Create New Tag</ResponsiveModal.Title>
            </ResponsiveModal.Header>

            <ResponsiveModal.Content>
                {/* Form with its own submit button */}
                <form>
                    <input type="text" placeholder="Tag name" />
                    <Button type="submit">Create</Button>
                </form>
            </ResponsiveModal.Content>
        </ResponsiveModal>
    );
};

// ============================================
// Example 3: Multi-Step Modal
// ============================================

export const MultiStepModal = ({ open, onOpenChange, step, setStep }) => {
    return (
        <ResponsiveModal open={open} onOpenChange={onOpenChange}>
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>
                    {step === 'select' && 'Select Profile Image'}
                    {step === 'edit' && 'Edit Profile Image'}
                    {step === 'uploading' && 'Uploading...'}
                </ResponsiveModal.Title>
            </ResponsiveModal.Header>

            <ResponsiveModal.Content scrollable={false}>
                {step === 'select' && <div>File dropzone component</div>}
                {step === 'edit' && <div>Image editor component</div>}
                {step === 'uploading' && <div>Upload progress component</div>}
            </ResponsiveModal.Content>

            {step !== 'uploading' && (
                <ResponsiveModal.Footer>
                    {step === 'select' && (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setStep('edit')}>Next</Button>
                        </>
                    )}
                    {step === 'edit' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('select')}>
                                Back
                            </Button>
                            <Button onClick={() => setStep('uploading')}>Save</Button>
                        </>
                    )}
                </ResponsiveModal.Footer>
            )}
        </ResponsiveModal>
    );
};

// ============================================
// Example 4: Multi-Step with Config Object
// ============================================

interface StepHandlers {
    onCancel: () => void;
    onNext: () => void;
    onBack: () => void;
    onSave: () => void;
}

const STEP_CONFIG = {
    step1: {
        title: 'Step 1: Select',
        content: <div>Step 1 content</div>,
        footer: (handlers: StepHandlers) => (
            <>
                <Button onClick={handlers.onCancel}>Cancel</Button>
                <Button onClick={handlers.onNext}>Next</Button>
            </>
        ),
    },
    step2: {
        title: 'Step 2: Configure',
        content: <div>Step 2 content</div>,
        footer: (handlers: StepHandlers) => (
            <>
                <Button onClick={handlers.onBack}>Back</Button>
                <Button onClick={handlers.onSave}>Save</Button>
            </>
        ),
    },
} as const;

export const ConfigBasedStepModal = ({
    open,
    onOpenChange,
    step,
    setStep,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    step: keyof typeof STEP_CONFIG;
    setStep: (step: keyof typeof STEP_CONFIG) => void;
}) => {
    const stepConfig = STEP_CONFIG[step as keyof typeof STEP_CONFIG];

    const handlers = {
        onCancel: () => onOpenChange(false),
        onNext: () => setStep('step2'),
        onBack: () => setStep('step1'),
        onSave: () => console.log('Saving...'),
    };

    return (
        <ResponsiveModal open={open} onOpenChange={onOpenChange}>
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>{stepConfig.title}</ResponsiveModal.Title>
            </ResponsiveModal.Header>

            <ResponsiveModal.Content>{stepConfig.content}</ResponsiveModal.Content>

            <ResponsiveModal.Footer>{stepConfig.footer(handlers)}</ResponsiveModal.Footer>
        </ResponsiveModal>
    );
};

// ============================================
// Example 5: Custom Scrollable Content
// ============================================

export const LongContentModal = ({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    return (
        <ResponsiveModal open={open} onOpenChange={onOpenChange} size="lg">
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>Terms and Conditions</ResponsiveModal.Title>
            </ResponsiveModal.Header>

            <ResponsiveModal.Content scrollable={true}>
                {/* Long scrollable content */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <p key={i}>Paragraph {i + 1} of terms and conditions...</p>
                ))}
            </ResponsiveModal.Content>

            <ResponsiveModal.Footer>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Decline
                </Button>
                <Button onClick={() => console.log('Accepted')}>Accept</Button>
            </ResponsiveModal.Footer>
        </ResponsiveModal>
    );
};

// ============================================
// Example 6: No Header Modal
// ============================================

export const NoHeaderModal = ({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    return (
        <ResponsiveModal open={open} onOpenChange={onOpenChange}>
            <ResponsiveModal.Content>
                <h2 className="text-lg font-semibold mb-4">Custom Header</h2>
                <p>Content without using ResponsiveModal.Header</p>
            </ResponsiveModal.Content>

            <ResponsiveModal.Footer>
                <Button onClick={() => onOpenChange(false)}>Close</Button>
            </ResponsiveModal.Footer>
        </ResponsiveModal>
    );
};
