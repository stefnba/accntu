import { Separator } from '@/components/ui/separator';
import { ActiveSessions } from '@/features/auth/components/active-sessions';
import { ProfileForm } from '@/features/user/components/profile-form';

export default function AccountPage() {
    return (
        <div className="space-y-6 m-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site.
                </p>
            </div>
            <Separator />
            <ProfileForm />

            <Separator className="my-6" />
            <ActiveSessions />
        </div>
    );
}
