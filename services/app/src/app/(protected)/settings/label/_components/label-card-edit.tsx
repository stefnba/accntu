'use client';

import { labelActions } from '@/actions';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useMutation } from '@/lib/hooks/actions';
import { PlusIcon } from 'lucide-react';
import { RxDotsHorizontal, RxTrash } from 'react-icons/rx';

interface Props {
    label: any;
}

export const LabelCardEdit: React.FC<Props> = ({ label }) => {
    const { execute: deleteLabel } = useMutation(labelActions.update);
    return (
        <div className="absolute top-2 right-2">
            <DropdownMenu>
                <DropdownMenuTrigger className="" asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted invisible group-hover:visible data-[state=open]:visible"
                    >
                        <RxDotsHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    onClick={(e) => e.stopPropagation()}
                    align="end"
                    alignOffset={-5}
                    className="w-[200px]"
                    forceMount
                >
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => alert('dd')}>
                        <PlusIcon className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <PlusIcon className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <PlusIcon className="mr-2 h-4 w-4" /> Create Sub-Label
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600">
                                <RxTrash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your account and remove
                                    your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog> */}
                    <DropdownMenuItem
                        onClick={() =>
                            deleteLabel({
                                id: label.id,
                                data: { delete: true }
                            })
                        }
                        className="text-red-600"
                    >
                        <RxTrash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
