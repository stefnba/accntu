import { Button } from '@/components/ui/button';
import { useImportModal } from '@/features/transaction-import/hooks';

interface UploadActionsProps {
    completedFilesCount: number;
    isProcessing: boolean;
    onContinue: () => void;
}

export const UploadActions = ({
    completedFilesCount,
    isProcessing,
    onContinue,
}: UploadActionsProps) => {
    const { setCurrentStep } = useImportModal();
    return (
        <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => setCurrentStep('accountSelection')}>
                Back
            </Button>

            <Button
                onClick={onContinue}
                disabled={completedFilesCount === 0 || isProcessing}
                className="min-w-32"
            >
                {isProcessing ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </div>
                ) : (
                    `Continue with ${completedFilesCount} file${completedFilesCount !== 1 ? 's' : ''}`
                )}
            </Button>
        </div>
    );
};
