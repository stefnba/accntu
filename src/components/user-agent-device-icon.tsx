import { parseUserAgent } from '@/lib/utils/user-agent';
import { Bot, Laptop, LucideIcon, Monitor, Smartphone, Tablet } from 'lucide-react';

/**
 * Helper function to get a concise device icon name based on user agent
 * @param userAgent - The user agent string
 * @returns An icon name or device type for use with icon libraries
 */
export function getDeviceIcon(userAgent: string | undefined | null): string {
    if (!userAgent) return 'device-unknown';

    const info = parseUserAgent(userAgent);

    if (info.isBot) return 'bot';

    if (info.isMobile) {
        if (info.device.vendor.toLowerCase().includes('apple')) return 'phone-apple';
        return 'phone-android';
    }

    if (info.isTablet) {
        if (info.device.vendor.toLowerCase().includes('apple')) return 'tablet-apple';
        return 'tablet-android';
    }

    // Desktop OS detection
    const osLower = info.os.name.toLowerCase();
    if (osLower.includes('mac') || osLower.includes('ios')) return 'desktop-apple';
    if (osLower.includes('windows')) return 'desktop-windows';
    if (osLower.includes('linux') || osLower.includes('ubuntu') || osLower.includes('debian'))
        return 'desktop-linux';

    return 'desktop-generic';
}

type DeviceIconProps = {
    userAgent: string | undefined | null;
    className?: string;
};

// Map of device types to icons
const DEVICE_ICONS: Record<string, LucideIcon> = {
    bot: Bot,
    'phone-apple': Smartphone,
    'phone-android': Smartphone,
    'tablet-apple': Tablet,
    'tablet-android': Tablet,
    'desktop-apple': Monitor,
    'desktop-windows': Monitor,
    'desktop-linux': Monitor,
    'desktop-generic': Monitor,
    'device-unknown': Laptop,
};

/**
 * DeviceIcon component that displays the appropriate icon based on the user agent
 */
export const DeviceIcon = ({ userAgent, className = 'h-4 w-4 mr-2' }: DeviceIconProps) => {
    const iconType = getDeviceIcon(userAgent);
    const IconComponent = DEVICE_ICONS[iconType] || Laptop;

    return <IconComponent className={className} />;
};
