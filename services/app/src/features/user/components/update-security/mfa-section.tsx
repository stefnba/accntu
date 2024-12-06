import { AccountCustomSection } from '@/features/user/components/update-section';

export const MultiFactorAuthSection = () => {
    return (
        <>
            <AccountCustomSection
                title="Multi-Factor Authentication"
                action={
                    <div className="text-sm text-muted-foreground">
                        Coming Soon...
                    </div>
                }
            />
        </>
    );
};
