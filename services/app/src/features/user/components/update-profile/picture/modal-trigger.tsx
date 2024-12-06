'use client';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { useUserUpdateModal } from '@features/user/hooks/user-update-modal';
import { AiOutlineEdit } from 'react-icons/ai';

interface Props {}

export const UpdateUserImageTrigger: React.FC<Props> = ({}) => {
    const { handleOpen } = useUserUpdateModal();
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    autoFocus={false}
                    className="rounded-full bg-white relative top-[-40px] right-[-32px] shadow-sm border"
                    size="icon"
                    onClick={() => handleOpen('picture')}
                    variant="ghost"
                >
                    <AiOutlineEdit className="size-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="start">
                Change Picture
            </TooltipContent>
        </Tooltip>
    );
};
