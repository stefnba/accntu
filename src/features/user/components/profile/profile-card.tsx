'use client';

import { SettingsCard } from '@/components/content';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/client';
import { Camera, Mail, User } from 'lucide-react';

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
        <SettingsCard.Auto
            title="Basic Information"
            description="Change your name, profile image, and more"
            items={[
                {
                    icon: User,
                    label: 'Name',
                    description: name,
                    action: (
                        <Button variant="outline" size="sm" onClick={() => openModal('name')}>
                            Update
                        </Button>
                    ),
                },
                {
                    icon: Mail,
                    label: 'Email',
                    description: user?.email || 'No email',
                    action: <div />, // Empty div for consistent spacing
                },
                {
                    icon: Camera,
                    label: 'Profile Picture',
                    description: 'Update your profile picture',
                    action: (
                        <Button variant="outline" size="sm" onClick={() => openModal('picture')}>
                            Update
                        </Button>
                    ),
                },
            ]}
        />
    );
};
