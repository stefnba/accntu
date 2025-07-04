'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Description } from '@/components/ui/font';
import { Label } from '@/components/ui/label';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { UserImageForm } from '@/features/user/components/profile/forms/user-image-form';
import { useAuth } from '@/lib/auth/client';
import { IconCamera } from '@tabler/icons-react';
import { useState } from 'react';

export function ProfileImageUpload() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    const hasImage = !!user?.image;

    return (
        <div className="flex flex-col gap-4 items-center sm:flex-row">
            <div className="relative group">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="size-full flex items-center justify-center cursor-pointer"
                        onClick={() => setOpen(true)}
                    >
                        <IconCamera className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col">
                <Label className="text-sm font-medium">Profile Image</Label>

                <Description>
                    {hasImage ? 'Change your profile picture' : 'Upload an image for your profile'}
                </Description>

                <div className="flex gap-2 mt-2">
                    <ResponsiveModal
                        open={open}
                        onOpenChange={setOpen}
                        title="Upload Profile Image"
                        description="Upload an image for your profile"
                    >
                        <UserImageForm />
                    </ResponsiveModal>
                    <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                        <IconCamera className="w-4 h-4 mr-1" />
                        Upload
                    </Button>
                </div>
            </div>
        </div>
    );
}
