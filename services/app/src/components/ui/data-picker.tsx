import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface Props {}

export function DatePicker({}: Props) {
    const field = '2024-01-01';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="sm"
                    variant={'outline'}
                    className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field && 'text-muted-foreground'
                    )}
                >
                    {field ? field : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    // selected={field.value}
                    // onSelect={field.onChange}
                    disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
