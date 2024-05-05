import { transactionActions } from '@/actions';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { LuCalendar } from 'react-icons/lu';

interface Props {
    id: string;
}

export const ViewTransactionSheetContent: React.FC<Props> = ({ id }) => {
    const { isLoading, data } = useQuery({
        queryKey: ['transaction', id],
        queryFn: () => transactionActions.findById({ id })
    });

    if (!data) return null;

    const {
        accountAmount,
        accountCurrency,
        spendingAmount,
        spendingCurrency,
        label
    } = data;

    return (
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
                    <div className="">
                        <span className="text-4xl font-bold">
                            {spendingAmount?.toLocaleString('en-US', {
                                maximumFractionDigits:
                                    spendingAmount % 1 != 0 &&
                                    spendingAmount < 1000
                                        ? 2
                                        : 0,
                                minimumFractionDigits:
                                    spendingAmount % 1 != 0 &&
                                    spendingAmount < 1000
                                        ? 2
                                        : 0,
                                currency: spendingCurrency
                            })}
                        </span>
                        <span className="text-sm ml-1">{spendingCurrency}</span>
                    </div>
                </div>
                <div>
                    <div className="text-muted-foreground text-sm">
                        Account Amount
                    </div>
                    <div className="">
                        <span className="text-4xl font-bold">
                            {accountAmount?.toLocaleString('en-US', {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                                currency: accountCurrency
                            })}
                        </span>
                        <span className="text-sm ml-1">{accountCurrency}</span>
                    </div>
                </div>
            </div>
            <div className="mb-6">
                <div className="text-muted-foreground text-sm">Label</div>
                {label ? label.name : 'No Label'}
            </div>
            <div className="flex space-x-10">
                <div>
                    <div className="text-muted-foreground text-sm">City</div>
                    {data.city ? data.city : 'No Label'}
                </div>
                <div>
                    <div className="text-muted-foreground text-sm">Country</div>
                    {data.country ? data.country : 'No Label'}
                </div>
            </div>
        </SheetContent>
    );
};
