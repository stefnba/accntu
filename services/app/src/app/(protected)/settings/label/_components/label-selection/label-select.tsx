'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { RiEdit2Line } from 'react-icons/ri';

import { LabelSelectionDialogContent } from './dialog-content';
import { TLabel } from './types';

interface Props {
    onSelect: (label: TLabel) => void;
}

export const LabelSelect: React.FC<Props> = ({ onSelect }) => {
    const [isOpen, setOpen] = useState(false);
    const [label, setLabel] = useState<TLabel | undefined>();

    const handleSelect = (label: TLabel) => {
        onSelect(label);
        setOpen(false);
        setLabel(label);
    };

    return (
        <div className="mt-8 space-y-2">
            <Label>Parent-Label</Label>
            <Dialog onOpenChange={(open) => setOpen(open)} open={isOpen}>
                <DialogTrigger asChild>
                    <div className="cursor-pointer flex w-full flex-col items-start justify-between rounded-md border px-4 py-3 sm:flex-row sm:items-center hover:shadow-sm">
                        <p className="text-sm font-medium leading-none">
                            <span className="mr-2 rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground">
                                asdfs
                            </span>
                            <span className="text-muted-foreground">
                                {label
                                    ? label.name
                                    : 'No Parent-Label selected'}
                            </span>
                        </p>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-sm text-muted-foreground"
                        >
                            <RiEdit2Line />
                        </Button>
                    </div>
                </DialogTrigger>
                <LabelSelectionDialogContent onSelect={handleSelect} />
            </Dialog>
        </div>
    );
};
