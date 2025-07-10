'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { iconMap, renderLabelIcon, type IconName } from '@/lib/utils/icon-renderer';
import { useEffect, useState } from 'react';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  className?: string;
}

export const IconPicker = ({ value, onChange, className }: IconPickerProps) => {
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(!value);

  // Reset picker state when value changes externally
  useEffect(() => {
    setShowPicker(!value);
  }, [value]);

  const iconNames = Object.keys(iconMap) as IconName[];
  
  const filteredIcons = iconNames.filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  const renderIcon = (iconName: IconName) => {
    return renderLabelIcon(iconName, 'w-4 h-4');
  };

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setShowPicker(false);
  };

  const handleChange = () => {
    setShowPicker(true);
    setSearch('');
  };

  const handleClear = () => {
    onChange('');
    setShowPicker(true);
  };

  // Show preview when icon is selected
  if (value && value in iconMap && !showPicker) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">Selected:</span>
          {renderIcon(value as IconName)}
          <span className="text-sm font-medium">{value}</span>
          <div className="ml-auto flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleChange}
              className="h-7 px-2"
            >
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show picker when no icon selected or when changing
  return (
    <div className={cn('space-y-4', className)}>
      <Input
        placeholder="Search icons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
        autoFocus
      />
      
      <ScrollArea className="h-48">
        <div className="grid grid-cols-6 gap-2 p-2">
          {filteredIcons.map((iconName) => (
            <Button
              key={iconName}
              type="button"
              variant={value === iconName ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleIconSelect(iconName)}
              className="h-10 w-10 p-0"
              title={iconName}
            >
              {renderIcon(iconName)}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {value && (
        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPicker(false)}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
};