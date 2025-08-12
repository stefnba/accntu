'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/lib/theme/hooks';
import { useState } from 'react';

export function AppearanceForm() {
    const { theme, setTheme, isLoaded } = useTheme();
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>(
        (theme as 'light' | 'dark' | 'system') || 'system'
    );

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setCurrentTheme(newTheme);
        setTheme(newTheme);
    };

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <RadioGroup
                    value={currentTheme}
                    onValueChange={handleThemeChange}
                    className="grid max-w-xl grid-cols-3 gap-10 pt-4"
                >
                    <div className="flex flex-col space-y-2">
                        <Label className="[&:has([data-state=checked])>div>div]:border-primary cursor-pointer">
                            <RadioGroupItem value="system" className="sr-only" />
                            <div className="flex flex-col">
                                <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer ">
                                    <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 text-center font-normal">System</div>
                            </div>
                        </Label>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Label className="[&:has([data-state=checked])>div>div]:border-primary cursor-pointer">
                            <RadioGroupItem value="light" className="sr-only" />
                            <div className="flex flex-col">
                                <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer ">
                                    <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 text-center font-normal">Light</div>
                            </div>
                        </Label>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Label className="[&:has([data-state=checked])>div>div]:border-primary cursor-pointer">
                            <RadioGroupItem value="dark" className="sr-only" />
                            <div className="flex flex-col">
                                <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                    <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <span className="block w-full p-2 text-center font-normal">
                                    Dark
                                </span>
                            </div>
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
}
