import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { LabelCard } from '@/features/label/components/label-card';
import { LabelSelectPopover } from '@/features/label/components/label-select';
import { useGetTransaction } from '@/features/transaction/api/get-transaction';
import { useUpdateTransaction } from '@/features/transaction/api/update-transaction';
import { storeViewUpdateTransactionSheet } from '@/features/transaction/store/view-update-transaction-sheet';
import { SelectLabelSchema } from '@db/schema';
import dayjs from 'dayjs';
import { Copy } from 'lucide-react';
import { LuCalendar, LuChevronsUpDown, LuMoreVertical } from 'react-icons/lu';
import { z } from 'zod';

import { TransactionType } from '../table/utils';

interface Props {}

export const ViewTransactionSheet: React.FC<Props> = () => {
    const transactionId = storeViewUpdateTransactionSheet((state) => state.id);
    const { isOpen, handleClose } = storeViewUpdateTransactionSheet();

    const { isLoading, data } = useGetTransaction({ id: transactionId });

    const { mutate: updateTransaction } = useUpdateTransaction({
        id: transactionId || ''
    });

    if (!data) return null;

    const {
        title,
        accountAmount,
        accountCurrency,
        spendingAmount,
        spendingCurrency,
        userAmount,
        userCurrency,
        type,
        label,
        note,
        country,
        city,
        createdAt,
        account
    } = data;

    const dateFormatted = dayjs(data?.date).format('ddd, DD-MMM YYYY');
    const createdAtFormatted = dayjs(createdAt).format('DD-MMM YYYY');

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent
                size="lg"
                className="p-0 overflow-scroll space-y-4"
                hideCloseButton={true}
            >
                <CardHeader className="flex flex-row items-start bg-muted/50 border-b">
                    <div className="grid gap-0.5">
                        <CardTitle className="group flex items-center gap-2 text-lg">
                            {title}
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <Copy className="h-3 w-3" />
                                <span className="sr-only">Edit Title</span>
                            </Button>
                        </CardTitle>
                        <CardDescription className="flex items-center">
                            <LuCalendar className="h-4 w-4 mr-1.5" />
                            <time dateTime={dateFormatted}>
                                {dateFormatted}
                            </time>
                        </CardDescription>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                >
                                    <LuMoreVertical className="h-3.5 w-3.5" />
                                    <span className="sr-only">More</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Export</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Trash</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <div className="px-6 text-sm">
                    {/* Label */}
                    <div className="grid gap-3">
                        <div className="font-semibold">Label</div>

                        {!label && (
                            <div>
                                <span className="text-muted-foreground">
                                    No label assigned
                                </span>
                                <LabelSelectPopover
                                    handleSelect={(labelId) =>
                                        updateTransaction({ labelId })
                                    }
                                >
                                    <Button variant="link" size="sm">
                                        Select Label
                                    </Button>
                                </LabelSelectPopover>
                            </div>
                        )}

                        {label && (
                            <div>
                                <LabelCard
                                    label={label}
                                    action={
                                        <LabelSelectPopover
                                            handleSelect={(labelId) =>
                                                updateTransaction({ labelId })
                                            }
                                        >
                                            <Button variant="ghost" size="sm">
                                                <LuChevronsUpDown />
                                            </Button>
                                        </LabelSelectPopover>
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <Separator className="my-4" />

                    {/* Amount */}
                    <div className="grid gap-3">
                        <div className="font-semibold">Amount Details</div>
                        <ul className="grid gap-3">
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Transaction
                                </span>
                                <Amount
                                    amount={spendingAmount}
                                    currency={spendingCurrency}
                                />
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Booked
                                </span>
                                <Amount
                                    amount={accountAmount}
                                    currency={accountCurrency}
                                />
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Budget
                                </span>
                                <Amount
                                    amount={userAmount}
                                    currency={userCurrency}
                                />
                            </li>
                        </ul>
                    </div>
                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4">
                        {/* Account */}
                        <div className="grid gap-3">
                            <div className="font-semibold">Account</div>
                            <div className="grid gap-0.5 not-italic text-muted-foreground">
                                <span>
                                    {account.name} - {account.bank.bank.name}
                                </span>
                            </div>
                        </div>
                        {/* Type */}
                        <div className="space-y-3">
                            <div className="font-semibold">Type</div>
                            {/* <div className="grid gap-0.5 not-italic text-muted-foreground"> */}
                            <TransactionType type={type} />
                            {/* </div> */}
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Info */}
                    <div className="grid gap-3">
                        <div className="font-semibold">
                            Additional Information
                        </div>
                        <dl className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <dt className="text-muted-foreground">
                                    Location
                                </dt>
                                <dd>Zurich, CH</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-muted-foreground">Tags</dt>
                                <dd className="space-x-1">
                                    <Badge>Travel</Badge>
                                    <Badge>Travel</Badge>
                                    <Badge>Travel</Badge>
                                    <Badge>Travel</Badge>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <Separator className="my-4" />

                    {/* Note */}
                    <div className="grid gap-3">
                        <div className="font-semibold ">Note</div>
                        <span className="text-justify">
                            Die Elf von Julian Nagelsmann agiert extrem geduldig
                            und erhöht nun auf 2:0. Deutschland wartet, bis die
                            Bravehearts sich aus der Reserve locken lassen, und
                            spielt dann explosionsartig nach vorne. Gündoğan
                            findet Havertz mit einem Zuckerpass, der es selbst
                            machen könnte, aber lieber wartet, bis Musiala
                            nachrückt. Das Zuspiel kommt an und der Münchner
                            Spieler lässt sich nicht zweimal bitten.
                            Kompromisslos nagelt er die Kugel aus elf Metern mit
                            rechts oben links in den Winkel. Nichts zu halten
                            für Gunn.
                        </span>
                    </div>
                </div>

                <SheetFooter className="border-t bg-muted/50 px-6 py-3 absolute bottom-0 w-full">
                    <div className="text-xs text-muted-foreground">
                        Imported{' '}
                        <time dateTime={createdAtFormatted}>
                            {createdAtFormatted}
                        </time>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

const Info: React.FC<{ label: string; info?: string | null }> = ({
    label,
    info
}) => {
    if (!info) return null;

    return (
        <div>
            <div className="text-muted-foreground text-sm">{label}</div>
            <span className="text">{info}</span>
        </div>
    );
};

const Amount: React.FC<{ amount: number; currency: string }> = ({
    amount,
    currency
}) => {
    return (
        <span>
            {currency}{' '}
            {(amount / 100).toLocaleString('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
                currency: currency
            })}
        </span>
    );
};

const AmountCard: React.FC<{ amount: number; currency: string }> = ({
    amount,
    currency
}) => {
    const decimale = Number(String(amount).slice(-2));

    return (
        <div>
            <span className="text-4xl font-bold">
                {Math.trunc(amount / 100).toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                    currency: currency
                })}
            </span>
            {decimale === 0 ? <span></span> : <span>.{decimale}</span>}

            <span className="text-sm ml-1">{currency}</span>
        </div>
    );
};

const Label: React.FC<{ label: z.infer<typeof SelectLabelSchema> | null }> = ({
    label
}) => {
    if (!label) return null;

    return <LabelCard label={label} />;
};
