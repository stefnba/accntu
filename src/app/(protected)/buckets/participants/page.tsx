'use client';

import { ParticipantManager } from '@/features/bucket/components/bucketParticipant-manager';

export default function ParticipantsSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Participants</h3>
                <p className="text-sm text-muted-foreground">
                    Manage the participants you can assign to buckets.
                </p>
            </div>
            <ParticipantManager />
        </div>
    );
}
