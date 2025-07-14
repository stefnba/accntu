'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Description } from '@/components/ui/font';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth/client';
import { IconCamera, IconEdit } from '@tabler/icons-react';
import { User } from 'lucide-react';

import { useProfileUpdateModal } from '@/features/user/hooks';
import { generateDisplayName } from '@/features/user/utils';

export const ProfileCard = () => {
    const { user } = useAuth();

    const { openModal } = useProfileUpdateModal();

    const name = user
        ? generateDisplayName({
              name: user.name,
              lastName: user.lastName,
              email: user.email,
          })
        : 'No name';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                </CardTitle>
                <CardDescription>Change your name, profile image, and more</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Action Rows */}
                <div className="space-y-3">
                    <Separator />

                    {/* Name */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                            <Label>Name</Label>
                            <Description>{name}</Description>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openModal('name')}>
                            <IconEdit className="w-4 h-4 mr-1" />
                            Update Name
                        </Button>
                    </div>

                    <Separator />

                    {/* Email */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                            <Label>Email</Label>
                            <Description>{user?.email}</Description>
                        </div>
                    </div>

                    <Separator />

                    {/* Picture */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                            <Label>Profile Picture</Label>
                            {/* <Description>Update your profile picture</Description> */}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openModal('picture')}>
                            <IconCamera className="w-4 h-4 mr-1" />
                            Update Picture
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
