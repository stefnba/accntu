import { Badge } from '@/components/ui/badge';
import { TGlobalBank } from '@/features/bank/server/db/schemas';

interface IntegrationTypeBadgeProps {
    integrationType: TGlobalBank['integrationTypes'] | null | undefined;
}

const integrationTypeMapping: Record<TGlobalBank['integrationTypes'], string> = {
    api: 'API',
    csv: 'Upload',
} as const;

/**
 * Display a badge with the integration type (e.g. API, Upload, etc.).
 */
export const IntegrationTypeBadge: React.FC<IntegrationTypeBadgeProps> = ({ integrationType }) => {
    if (!integrationType) {
        return null;
    }

    const integrationTypeLabel = integrationTypeMapping[integrationType];

    if (!integrationTypeLabel) {
        return null;
    }

    if (integrationType === 'api') {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                {integrationTypeLabel}
            </Badge>
        );
    }

    if (integrationType === 'csv') {
        return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                {integrationTypeLabel}
            </Badge>
        );
    }

    return null;
};
