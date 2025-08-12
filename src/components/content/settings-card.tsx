import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Root wrapper component that provides the card container
 */
const SettingsCardRoot = ({ children, className }: SettingsCardProps) => {
    return <Card className={cn(className)}>{children}</Card>;
};

interface SettingsCardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Header section for the settings card title and description area
 */
const SettingsCardHeader = ({ children, className }: SettingsCardHeaderProps) => {
    return <CardHeader className={cn(className)}>{children}</CardHeader>;
};

interface SettingsCardTitleProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Title component for the settings card header
 */
const SettingsCardTitle = ({ children, className }: SettingsCardTitleProps) => {
    return <CardTitle className={cn(className)}>{children}</CardTitle>;
};

interface SettingsCardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Description component for the settings card header
 */
const SettingsCardDescription = ({ children, className }: SettingsCardDescriptionProps) => {
    return <CardDescription className={cn(className)}>{children}</CardDescription>;
};

interface SettingsCardContentProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Content area with spacing for settings items
 */
const SettingsCardContent = ({ children, className }: SettingsCardContentProps) => {
    return <CardContent className={cn('space-y-6', className)}>{children}</CardContent>;
};

interface SettingsCardItemProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Individual settings item wrapper with icon, content, and action layout
 */
const SettingsCardItem = ({ children, className }: SettingsCardItemProps) => {
    return <div className={cn('flex items-start space-x-3', className)}>{children}</div>;
};

interface SettingsCardIconProps {
    icon: LucideIcon;
    className?: string;
}

/**
 * Icon component for settings items
 */
const SettingsCardIcon = ({ icon: Icon, className }: SettingsCardIconProps) => {
    return <Icon className={cn('h-5 w-5 text-muted-foreground mt-0.5', className)} />;
};

interface SettingsCardBodyProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Body wrapper for title, description, and action
 */
const SettingsCardBody = ({ children, className }: SettingsCardBodyProps) => {
    return <div className={cn('flex-1', className)}>{children}</div>;
};

interface SettingsCardLabelProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Label component for individual setting titles
 */
const SettingsCardLabel = ({ children, className }: SettingsCardLabelProps) => {
    return <div className={cn('font-medium', className)}>{children}</div>;
};

interface SettingsCardTextProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Text component for setting descriptions
 */
const SettingsCardText = ({ children, className }: SettingsCardTextProps) => {
    return <div className={cn('text-sm text-muted-foreground', className)}>{children}</div>;
};

interface SettingsCardActionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Action wrapper for controls like switches, buttons, etc.
 */
const SettingsCardAction = ({ children, className }: SettingsCardActionProps) => {
    return <div className={cn('flex items-center', className)}>{children}</div>;
};

interface SettingsCardAutoItem {
    icon: LucideIcon;
    label: string;
    description: string;
    action: React.ReactNode;
}

interface SettingsCardAutoProps {
    title: string;
    description?: string;
    items: SettingsCardAutoItem[];
    className?: string;
}

/**
 * Auto-layout component for quick settings cards with title, description, and items array
 */
const SettingsCardAuto = ({ title, description, items, className }: SettingsCardAutoProps) => {
    return (
        <SettingsCardRoot className={className}>
            <SettingsCardHeader>
                <SettingsCardTitle>{title}</SettingsCardTitle>
                {description && <SettingsCardDescription>{description}</SettingsCardDescription>}
            </SettingsCardHeader>
            <SettingsCardContent>
                {items.map((item, index) => (
                    <SettingsCardItem key={index}>
                        <SettingsCardIcon icon={item.icon} />
                        <SettingsCardBody>
                            <div className="flex items-center justify-between">
                                <div>
                                    <SettingsCardLabel>{item.label}</SettingsCardLabel>
                                    <SettingsCardText>{item.description}</SettingsCardText>
                                </div>
                                <SettingsCardAction>{item.action}</SettingsCardAction>
                            </div>
                        </SettingsCardBody>
                    </SettingsCardItem>
                ))}
            </SettingsCardContent>
        </SettingsCardRoot>
    );
};

/**
 * SettingsCard - A flexible component for displaying settings with icons, descriptions, and actions
 * 
 * @example
 * // Compound Components (Full Flexibility)
 * <SettingsCard>
 *   <SettingsCard.Header>
 *     <SettingsCard.Title>Communication</SettingsCard.Title>
 *     <SettingsCard.Description>How you receive updates and messages</SettingsCard.Description>
 *   </SettingsCard.Header>
 *   <SettingsCard.Content>
 *     <SettingsCard.Item>
 *       <SettingsCard.Icon icon={Mail} />
 *       <SettingsCard.Body>
 *         <SettingsCard.Label>Email Notifications</SettingsCard.Label>
 *         <SettingsCard.Text>Receive notifications via email</SettingsCard.Text>
 *         <SettingsCard.Action>
 *           <Switch />
 *         </SettingsCard.Action>
 *       </SettingsCard.Body>
 *     </SettingsCard.Item>
 *   </SettingsCard.Content>
 * </SettingsCard>
 * 
 * @example
 * // Auto-layout API (Convenience)
 * <SettingsCard.Auto 
 *   title="Communication"
 *   description="How you receive updates and messages"
 *   items={[
 *     { 
 *       icon: Mail, 
 *       label: "Email Notifications", 
 *       description: "Receive notifications via email", 
 *       action: <Switch checked={true} /> 
 *     },
 *     { 
 *       icon: Bell, 
 *       label: "Push Notifications", 
 *       description: "Receive push notifications in your browser", 
 *       action: <Switch checked={false} /> 
 *     }
 *   ]}
 * />
 */
export const SettingsCard = Object.assign(SettingsCardRoot, {
    Header: SettingsCardHeader,
    Title: SettingsCardTitle,
    Description: SettingsCardDescription,
    Content: SettingsCardContent,
    Item: SettingsCardItem,
    Icon: SettingsCardIcon,
    Body: SettingsCardBody,
    Label: SettingsCardLabel,
    Text: SettingsCardText,
    Action: SettingsCardAction,
    Auto: SettingsCardAuto,
});

export {
    SettingsCardHeader,
    SettingsCardTitle,
    SettingsCardDescription,
    SettingsCardContent,
    SettingsCardItem,
    SettingsCardIcon,
    SettingsCardBody,
    SettingsCardLabel,
    SettingsCardText,
    SettingsCardAction,
};