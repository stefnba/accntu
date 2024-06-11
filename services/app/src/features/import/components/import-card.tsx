import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import type { ImportResponse } from '@/features/import/api/get-imports';
import { storeViewImportSheet } from '@/features/import/store/view-import-sheet';
import dayjs from 'dayjs';

interface Props {
    importRecord: ImportResponse[0];
}

export const ImportCard: React.FC<Props> = ({ importRecord }) => {
    const { successAt, createdAt, id, importedTransactionCount } = importRecord;
    const { handleOpen } = storeViewImportSheet();

    return (
        <Card onClick={() => handleOpen(importRecord.id)}>
            <CardHeader>
                <CardTitle>
                    {dayjs(createdAt).format('DD-MMM YY HH:mm')}
                </CardTitle>
                <CardDescription>
                    {importRecord.account.name}
                    {' - '}
                    {importRecord.account.bank.bank.name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex">
                    {successAt ? (
                        <Badge variant="default">Completed</Badge>
                    ) : (
                        <Badge variant="outline">Draft</Badge>
                    )}
                    {(importedTransactionCount || 0) > 0 && (
                        <CardDescription className="ml-4">
                            {importRecord.importedTransactionCount} Transactions
                        </CardDescription>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
