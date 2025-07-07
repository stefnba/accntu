import { MainContent } from '@/components/layout/main';
import { Metadata } from 'next';

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
            <div>TagsPage</div>
        </MainContent>
    );
}
