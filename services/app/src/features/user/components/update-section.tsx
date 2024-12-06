'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface Props {
    title: string;
    subTitle?: string;
    action?: React.ReactElement;
    content?: React.ReactElement;
}

export const AccountCustomSection = ({
    title,
    subTitle,
    action: Action,
    content: Content
}: Props) => {
    return (
        <div className="w-full">
            <div className="my-6 flex content-center">
                <div className="my-auto">
                    <Label size="lg">{title}</Label>
                    {subTitle && (
                        <p className="text-sm text-muted-foreground">
                            {subTitle}
                        </p>
                    )}
                </div>
                <div className="my-auto ml-auto">{Action}</div>
            </div>
            {Content && <div className="my-6">{Content}</div>}
        </div>
    );
};

export const AccountCollapsibleSection: React.FC<
    Props & {
        isOpen: boolean;
        onOpenChange: (open: boolean) => void;
    }
> = ({ title, content: Content, subTitle, isOpen, onOpenChange }) => {
    const ContentRender = () => {
        if (!isOpen) return null;

        return Content;
    };

    return (
        <AccountCustomSection
            title={title}
            subTitle={subTitle}
            content={<ContentRender />}
            action={
                <Button
                    variant="link"
                    className="text-primary"
                    onClick={() => onOpenChange(!isOpen)}
                >
                    {!isOpen ? 'Update' : 'Cancel'}
                </Button>
            }
        />
    );
};
