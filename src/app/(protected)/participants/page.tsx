'use client';

import { MainContent } from '@/components/layout/main';
import { ParticipantManager } from '@/features/participant/components';
import { ParticipantPageHeaderActionBar } from '@/features/participant/components/page-header-action-bar';

export default function ParticipantsPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Participants',
                description: 'Manage the participants you can assign to buckets.',
                actionBar: <ParticipantPageHeaderActionBar />,
            }}
        >
            <ParticipantManager />
        </MainContent>
    );
}
