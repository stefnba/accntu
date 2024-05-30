import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { useGetTransaction } from '@/features/transaction/api/get-transaction';
import { Amount } from '@/features/transaction/components/utils';
import { storeViewUpdateTransactionSheet } from '@/features/transaction/store/view-update-transaction-sheet';
import dayjs from 'dayjs';
import { LuCalendar } from 'react-icons/lu';

interface Props {}

export const ViewTransactionSheet: React.FC<Props> = () => {
    const transactionId = storeViewUpdateTransactionSheet((state) => state.id);
    const { isOpen, handleClose } = storeViewUpdateTransactionSheet();

    const { isLoading, data } = useGetTransaction({ id: transactionId });

    if (!data) return null;

    const {
        accountAmount,
        accountCurrency,
        spendingAmount,
        spendingCurrency,
        label
    } = data;

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent size="lg">
                <SheetHeader className="mb-8">
                    {data?.title && <SheetTitle>{data.title}</SheetTitle>}
                    <SheetDescription className="flex items-center">
                        <LuCalendar className="h-4 w-4 mr-1" />
                        {dayjs(data?.date).format('ddd, DD-MMM YYYY')}
                    </SheetDescription>
                </SheetHeader>
                <div className="flex space-x-14 mb-10">
                    <div>
                        <div className="text-muted-foreground text-sm">
                            Spending Amount
                        </div>
                        <Amount
                            amount={spendingAmount}
                            currency={spendingCurrency}
                        />
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">
                            Account Amount
                        </div>
                        <Amount
                            amount={accountAmount}
                            currency={accountCurrency}
                        />
                    </div>
                </div>
                <div className="mb-6">
                    <div className="text-muted-foreground text-sm">Label</div>
                    {label ? label.name : 'No Label'}
                </div>
                <div className="flex space-x-10">
                    <div>
                        <div className="text-muted-foreground text-sm">
                            City
                        </div>
                        {data.city ? data.city : 'No Label'}
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">
                            Country
                        </div>
                        {data.country ? data.country : 'No Label'}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
