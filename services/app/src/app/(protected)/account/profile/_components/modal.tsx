'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { useState } from 'react';

interface Props {
    title: String;
    description?: String;
    formComponent: React.ElementType;
    className?: string;
}

const SectionModal: React.FC<Props> = ({
    title,
    description,
    formComponent: Form,
    className
}) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={className}
                    onClick={() => setOpen(true)}
                    variant="outline"
                >
                    Update
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                <div className="mt-8">
                    <Form setOpen={setOpen} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SectionModal;
