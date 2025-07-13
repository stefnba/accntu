'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Description } from '@/components/ui/font';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth/client';
import { IconCamera, IconEdit, IconUserCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { ProfileImageModal } from './profile-image-modal';

type ModalMode = 'upload' | 'edit';

export function ProfileImageUpload() {
    const { user } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('upload');

    const hasImage = !!user?.image;

    const openModal = (mode: ModalMode) => {
        setModalMode(mode);
        setModalOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconUserCircle className="w-5 h-5" /> Profile Image
                </CardTitle>
                <CardDescription>Change your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Action Rows */}
                <div className="space-y-3">
                    <Separator />
                    
                    {/* Row 1: Edit Current Picture */}
                    {hasImage && (
                        <>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex-1">
                                    <Label>Edit Current Picture</Label>
                                    <Description>Crop, rotate, or adjust your existing photo</Description>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => openModal('edit')}>
                                    <IconEdit className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Row 2: Upload New Picture */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                            <Label>Upload New Picture</Label>
                            <Description>Choose a new image from your device</Description>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openModal('upload')}>
                            <IconCamera className="w-4 h-4 mr-1" />
                            Upload
                        </Button>
                    </div>
                </div>

                {/* Enhanced Modal */}
                <ProfileImageModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    mode={modalMode}
                />
            </CardContent>
        </Card>
    );
}
