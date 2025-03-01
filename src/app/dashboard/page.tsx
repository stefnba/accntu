import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { DashboardContent } from '@/features/dashboard/components/dashboard-content';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
