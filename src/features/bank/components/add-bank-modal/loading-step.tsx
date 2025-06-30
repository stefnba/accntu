interface LoadingStepProps {
    message?: string;
}

export const LoadingStep = ({
    message = 'Please wait while we connect to your bank...',
}: LoadingStepProps) => {
    return (
        <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div>
                <h2 className="text-lg font-semibold mb-2">Connecting accounts</h2>
                <p className="text-muted-foreground">{message}</p>
            </div>
        </div>
    );
};
