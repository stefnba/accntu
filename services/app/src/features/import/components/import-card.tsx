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
import { CircleIcon } from 'lucide-react';
import { LuImport } from 'react-icons/lu';

interface Props {
    importRecord: ImportResponse[0];
}

export const ImportCard: React.FC<Props> = ({ importRecord }) => {
    const { successAt, createdAt, id, importedTransactionCount } = importRecord;
    const { handleOpen } = storeViewImportSheet();

    return (
        <Card
            className="hover:shadow-md cursor-pointer hover:scale-[1.01]"
            onClick={() => handleOpen(importRecord.id)}
        >
            <CardHeader className="pb-6">
                <CardTitle>
                    {dayjs(createdAt).format('DD-MMM YY HH:mm')}
                </CardTitle>
                <CardDescription>
                    {importRecord.account.bank.bank.name}
                    {' - '}
                    {importRecord.account.name}
                </CardDescription>
            </CardHeader>
            <CardContent className="">
                {/* <div className="flex">
                    {(importedTransactionCount || 0) > 0 && (
                        <CardDescription className="ml-4">
                            {importRecord.importedTransactionCount} Transactions
                        </CardDescription>
                    )}
                </div> */}
                <div className="flex space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <CircleIcon
                            style={{
                                fill: successAt ? '#22c55e' : '#fbbf24',
                                color: successAt ? '#22c55e' : '#fbbf24'
                            }}
                            className="mr-1 h-3 w-3"
                        />
                        {successAt ? 'Completed' : 'Pending'}
                    </div>
                    {(importedTransactionCount || 0) > 0 && (
                        <div className="flex items-center">
                            <LuImport className="mr-1 h-3 w-3" />
                            {importedTransactionCount} Transactions
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
