'use client';

import { Button } from '@/components/ui/button';
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
        <div className="mr-6">
            <div className="my-6 flex content-center">
                <div className="my-auto">
                    <div className="text-lg font-semibold">{title}</div>
                    {subTitle && (
                        <p className="text-md text-muted-foreground">
                            {subTitle}
                        </p>
                    )}
                </div>
                <div className="my-auto ml-auto cursor-pointer text-primary">
                    {Action}
                </div>
            </div>
            {Content && <div className="my-6">{Content}</div>}
            <Separator />
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
                <Button variant="outline" onClick={() => onOpenChange(!isOpen)}>
                    {!isOpen ? 'Update' : 'Cancel'}
                </Button>
            }
        />
    );
};
