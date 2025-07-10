import {
    Book,
    Briefcase,
    Building,
    Calendar,
    Camera,
    Car,
    Clock,
    Coffee,
    CreditCard,
    DollarSign,
    Gift,
    Heart,
    Home,
    MapPin,
    Monitor,
    Music,
    Phone,
    Plane,
    ShoppingCart,
    Smartphone,
    User,
    Users,
    Utensils,
    Wallet,
    Wifi,
    Zap,
} from 'lucide-react';

// Map of icon names to components
export const iconMap = {
    Home: Home,
    ShoppingCart: ShoppingCart,
    Car: Car,
    Plane: Plane,
    Utensils: Utensils,
    Coffee: Coffee,
    Heart: Heart,
    Gift: Gift,
    Book: Book,
    Briefcase: Briefcase,
    CreditCard: CreditCard,
    Wallet: Wallet,
    Zap: Zap,
    Phone: Phone,
    Wifi: Wifi,
    Music: Music,
    Camera: Camera,
    Monitor: Monitor,
    Smartphone: Smartphone,
    DollarSign: DollarSign,
    MapPin: MapPin,
    Calendar: Calendar,
    Clock: Clock,
    User: User,
    Users: Users,
    Building: Building,
} as const;

export type IconName = keyof typeof iconMap;

export const renderLabelIcon = (iconName?: string | null, className = 'size-4') => {
    if (!iconName || !(iconName in iconMap)) {
        return null;
    }

    const IconComponent = iconMap[iconName as IconName];
    return <IconComponent className={className} />;
};
