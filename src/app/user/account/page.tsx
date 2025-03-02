import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppearanceForm } from '@/features/user/components/appearance-form';
import { ProfileForm } from '@/features/user/components/profile-form';
import Link from 'next/link';

export default function AccountPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Account Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                    <Link href={'/dashboard'}>Back to Dashboard</Link>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <ProfileForm />
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance">
                        <AppearanceForm />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
