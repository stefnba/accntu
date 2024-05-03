'use client';

import { labelActions } from '@/actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import React, { MouseEventHandler, useState } from 'react';
import { LuSearch } from 'react-icons/lu';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { RiHotelBedLine } from 'react-icons/ri';

import { TLabel } from './types';

interface Props {
    onSelect: (label: TLabel) => void;
}

export const LabelSelectionDialogContent: React.FC<Props> = ({ onSelect }) => {
    const [parentLabelId, setParentLabelId] = useState<string | null>(null);

    const { data: labels = [], isLoading } = useQuery({
        queryKey: ['labels', { parentLabelId }],
        queryFn: () => labelActions.list({ parentId: parentLabelId })
    });

    const handleSelectLabel = (label: TLabel) => {
        onSelect(label);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Select a Label</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here.
                </DialogDescription>
            </DialogHeader>

            <div className="relative">
                <LuSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search" className="pl-8" />
            </div>

            {parentLabelId && (
                <Button
                    onClick={() =>
                        setParentLabelId(
                            labels[0]?.parentLabel?.parentId || null
                        )
                    }
                >
                    Back
                </Button>
            )}

            {isLoading &&
                [1, 2, 3].map((i) => (
                    <Card key={i}>
                        <div className="flex items-center ml-6">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <CardHeader>
                                {/* <Skeleton className="h-[24px] w-full" /> */}
                                <Skeleton className="h-[24px] w-[200px]" />
                            </CardHeader>
                            <Skeleton className="w-9 h-[2px] p-0 ml-auto mr-4" />
                        </div>
                    </Card>
                ))}
            <div className="space-y-2 grid-cols-2">
                {/* <div className="space-y-2 max-h-96 overflow-scroll border-b shadow-sm "> */}
                {labels?.map((label) => (
                    <Card
                        onClick={() => handleSelectLabel(label)}
                        key={label.id}
                        className="hover:shadow-sm cursor-pointer"
                    >
                        <div className="flex items-center ml-6">
                            <RiHotelBedLine className="h-8 w-8 text-primary/50" />
                            <CardHeader>
                                <CardTitle>{label.name}</CardTitle>
                            </CardHeader>
                            {label.childLabels &&
                                label.childLabels.length > 0 && (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setParentLabelId(label.id);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="w-9 p-0 ml-auto mr-4"
                                    >
                                        <MdKeyboardArrowRight className="h-6 w-6" />
                                        <span className="sr-only">
                                            View Child-Labels
                                        </span>
                                    </Button>
                                )}
                        </div>
                    </Card>
                ))}
            </div>
        </DialogContent>
    );
};
