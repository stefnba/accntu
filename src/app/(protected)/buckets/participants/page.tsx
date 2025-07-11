'use client';

import { MainContent } from '@/components/layout/main';
import { ParticipantManager } from '@/features/participant/components';

export default function ParticipantsPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Participants',
                description: 'Manage the participants you can assign to buckets.',
            }}
        >
            <ParticipantManager />
        </MainContent>
    );
}
