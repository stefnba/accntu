'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

/**
 * A responsive modal component that uses a dialog for desktop and a drawer for mobile.
 * @param children - The content to display in the modal.
 * @param open - Whether the modal is open.
 * @param onOpenChange - The function to call when the modal is opened or closed.
 */
export const ResponsiveModal: React.FC<Props> = ({ children, open, onOpenChange }) => {
    const isMobile = useIsMobile();

    if (!isMobile) {
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
            <DrawerContent className="pb-4 px-4">
                <div className="overflow-y-auto hide-scrollbar max-h-[85vh] pt-4">{children}</div>
            </DrawerContent>
        </Drawer>
    );
};
