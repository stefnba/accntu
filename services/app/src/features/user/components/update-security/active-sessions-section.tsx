import { AccountCustomSection } from '@/features/user/components/update-section';

export const ActiveSessionsSection = () => {
    return (
        <>
            <AccountCustomSection
                title="Active Sessions"
                action={
                    <div className="text-sm text-muted-foreground">
                        Coming Soon...
                    </div>
                }
            />
        </>
    );
};
