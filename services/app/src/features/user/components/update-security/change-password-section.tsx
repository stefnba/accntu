import { AccountCustomSection } from '@/features/user/components/update-section';

export const ChangePasswordSection = () => {
    return (
        <>
            <AccountCustomSection
                title="Change Password"
                action={
                    <div className="text-sm text-muted-foreground">
                        Coming Soon...
                    </div>
                }
            />
        </>
    );
};
