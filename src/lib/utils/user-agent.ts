import * as UAParserJS from 'ua-parser-js';

export type DeviceInfo = {
    browser: {
        name: string;
        version: string;
    };
    os: {
        name: string;
        version: string;
    };
    device: {
        type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
        vendor: string;
        model: string;
    };
    isDesktop: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isBot: boolean;
    fullName: string;
    shortName: string;
};

/**
 * Parse a user agent string into a human-readable device info object
 * @param userAgent - The user agent string to parse
 * @returns Structured information about the device, browser, and OS
 */
export function parseUserAgent(userAgent: string | undefined | null): DeviceInfo {
    if (!userAgent) {
        return getUnknownDevice();
    }

    const parser = new UAParserJS.UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    // Determine if it's a bot
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

    // Determine device type more accurately
    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';

    if (device.type === 'mobile') {
        deviceType = 'mobile';
    } else if (device.type === 'tablet') {
        deviceType = 'tablet';
    } else if (!device.type && !isBot) {
        deviceType = 'desktop';
    }

    // Format browser name and version
    const browserName = browser.name || 'Unknown';
    const browserVersion = browser.version ? browser.version.split('.')[0] || '' : '';

    // Format OS name and version
    const osName = os.name || 'Unknown';
    const osVersion = os.version || '';

    // Create names based on various conditions
    let fullName = `${browserName} on ${osName}`;
    let shortName = browserName;

    // Set shortName based on device type
    if (isBot) {
        shortName = 'Bot';
        fullName = `Bot (${browserName})`;
    } else if (device.vendor) {
        const vendorName = device.vendor.trim();
        fullName = `${browserName} on ${vendorName} ${device.model || ''}`;
        shortName = `${browserName} on ${vendorName}`;

        if (osName !== 'Unknown') {
            fullName += ` (${osName})`;
        }
    } else if (deviceType === 'mobile') {
        shortName = `${browserName} on Mobile`;
    } else if (deviceType === 'tablet') {
        shortName = `${browserName} on Tablet`;
    } else if (deviceType === 'desktop') {
        shortName = `${browserName} on ${osName !== 'Unknown' ? osName : 'Desktop'}`;
    }

    // Add browser version if available (only for fullName)
    if (browserVersion && !isBot) {
        fullName = fullName.replace(browserName, `${browserName} ${browserVersion}`);
    }

    return {
        browser: {
            name: browserName,
            version: browser.version || '',
        },
        os: {
            name: osName,
            version: osVersion,
        },
        device: {
            type: deviceType,
            vendor: device.vendor || '',
            model: device.model || '',
        },
        isDesktop: deviceType === 'desktop',
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isBot,
        fullName,
        shortName,
    };
}

/**
 * Return a default unknown device when user agent is not available
 */
function getUnknownDevice(): DeviceInfo {
    return {
        browser: {
            name: 'Unknown',
            version: '',
        },
        os: {
            name: 'Unknown',
            version: '',
        },
        device: {
            type: 'unknown',
            vendor: '',
            model: '',
        },
        isDesktop: false,
        isMobile: false,
        isTablet: false,
        isBot: false,
        fullName: 'Unknown device',
        shortName: 'Unknown',
    };
}

/**
 * Get a simple readable device type name
 * @param userAgent - The user agent string
 * @returns A human-readable device type
 */
export function getDeviceType(userAgent: string | undefined | null): string {
    const info = parseUserAgent(userAgent);

    if (info.isBot) return 'Bot';
    if (info.isMobile) return 'Mobile';
    if (info.isTablet) return 'Tablet';
    if (info.isDesktop) return 'Desktop';

    return 'Unknown Device';
}
