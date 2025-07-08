import { BackButton } from '@/components/back-button';
import { PageHeader, type PageHeaderProps } from '@/components/page-header';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const mainContentVariants = cva('flex flex-col gap-4 min-h-screen', {
    variants: {
        variant: {
            light: 'bg-gray-50/60',
            white: 'bg-white',
        },
    },
    defaultVariants: {
        variant: 'light',
    },
});

interface MainContentProps extends VariantProps<typeof mainContentVariants> {
    children: React.ReactNode;
    className?: string;
    pageHeader?: PageHeaderProps;
    limitWidth?: boolean;
    backButton?: boolean;
}

/**
 * MainContent is a component that wraps the main content of a page.
 * It can be used to display a page header and a main content area.
 *
 * @param props.children - The children of the MainContent component.
 * @param props.className - The className of the MainContent component.
 * @param props.variant - The variant of the MainContent component.
 * @param props.pageHeader - The page header of the MainContent component.
 */
export const MainContent: React.FC<MainContentProps> = ({
    children,
    className,
    variant,
    pageHeader,
    limitWidth = true,
    backButton = false,
}) => {
    // =========================
    // Render
    // =========================
    const renderPageHeader = () => {
        if (!pageHeader) return null;

        if (typeof pageHeader === 'string') {
            return <h1 className="text-2xl font-bold">{pageHeader}</h1>;
        }

        if (
            typeof pageHeader === 'object' &&
            !!pageHeader &&
            !('title' in pageHeader) &&
            !Array.isArray(pageHeader)
        ) {
            // ReactNode (not a plain object with title/description)
            return pageHeader;
        }

        if (typeof pageHeader === 'object' && 'title' in pageHeader) {
            return (
                <PageHeader
                    title={pageHeader.title}
                    description={pageHeader.description ?? undefined}
                    actionBar={pageHeader.actionBar ?? undefined}
                />
            );
        }

        return null;
    };

    const renderBackButton = () => {
        if (!backButton) return null;
        return <BackButton />;
    };

    const renderBookmarks = () => {
        return null;
    };

    return (
        <div className={cn(mainContentVariants({ variant }))}>
            <div
                className={cn('flex flex-col gap-4 p-6 w-full', limitWidth && 'max-w-7xl mx-auto')}
            >
                <div className="flex items-center gap-4">
                    {renderBackButton()}
                    {renderBookmarks()}
                </div>
                {renderPageHeader()}
                <div className={cn('w-full', className)}>{children}</div>
            </div>
        </div>
    );
};
