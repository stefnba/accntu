'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme/hooks';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function AppearanceForm() {
    const { theme, setTheme, isLoaded } = useTheme();
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>(
        (theme as 'light' | 'dark' | 'system') || 'system'
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasChanges = currentTheme !== theme;

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setCurrentTheme(newTheme);
    };

    const handleSave = async () => {
        if (!hasChanges) return;

        setIsSubmitting(true);
        try {
            setTheme(currentTheme);
            toast.success('Appearance settings updated');
        } catch (error) {
            toast.error('Failed to update appearance settings');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-pulse text-muted-foreground">Loading theme...</div>
            </div>
        );
    }

    const themeOptions = [
        {
            value: 'light',
            label: 'Light',
            icon: Sun,
            description: 'Clean and bright interface',
        },
        {
            value: 'dark',
            label: 'Dark',
            icon: Moon,
            description: 'Easy on the eyes in low light',
        },
        {
            value: 'system',
            label: 'System',
            icon: Monitor,
            description: 'Matches your device settings',
        },
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-2">Theme</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Choose how the interface looks and feels
                </p>
            </div>

            <div className="space-y-2">
                {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentTheme === option.value;

                    return (
                        <div
                            key={option.value}
                            className={cn(
                                'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200',
                                isSelected
                                    ? 'bg-primary/5 border-primary shadow-sm'
                                    : 'border-border hover:bg-muted/50'
                            )}
                            onClick={() => handleThemeChange(option.value)}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon className={cn(
                                    'h-5 w-5',
                                    isSelected ? 'text-primary' : 'text-muted-foreground'
                                )} />
                                <div>
                                    <div className={cn(
                                        'font-medium text-sm',
                                        isSelected ? 'text-primary' : 'text-foreground'
                                    )}>
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {option.description}
                                    </div>
                                </div>
                            </div>
                            {isSelected && (
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={!hasChanges || isSubmitting}
                    className="min-w-[100px]"
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
