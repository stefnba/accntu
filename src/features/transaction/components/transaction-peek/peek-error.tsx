interface PeekErrorProps {
    error: { error: { message: string } };
}

export const PeekError = ({ error }: PeekErrorProps) => {
    return (
        <div className="text-center py-8">
            <p className="text-destructive">Failed to load transaction</p>
            <p className="text-sm text-muted-foreground mt-1">
                {error.error.message}
            </p>
        </div>
    );
};