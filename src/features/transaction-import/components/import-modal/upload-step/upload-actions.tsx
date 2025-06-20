import { Button } from '@/components/ui/button';

interface UploadActionsProps {
    completedFilesCount: number;
    isProcessing: boolean;
    onBack: () => void;
    onContinue: () => void;
}

export const UploadActions = ({
    completedFilesCount,
    isProcessing,
    onBack,
    onContinue,
}: UploadActionsProps) => {
    return (
        <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
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
