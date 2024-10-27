'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useMedia } from 'react-use';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const ResponsiveModal: React.FC<Props> = ({
    children,
    open,
    onOpenChange
}) => {
    const isDesktop = useMedia('(min-width: 768px)', true);

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full sm:max-w-lg p-4 border-none overflow-y-auto max-h-[85vh]">
                    {children}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="mx-4 pb-4 px-4">
                <div className="overflow-y-auto hide-scrollbar max-h-[85vh] pt-4">
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    );
};
