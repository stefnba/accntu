import { MainContent } from '@/components/layout/main';
import { TagManager } from '@/features/tag/components/tag-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tags | Accntu',
    description: 'Manage your transaction tags',
};

export default function TagsPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Tags',
                description: 'View and manage your tags',
            }}
        >
            <TagManager />
        </MainContent>
    );
}
