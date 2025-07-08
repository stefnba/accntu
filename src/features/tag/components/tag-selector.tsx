'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTagEndpoints } from '@/features/tag/api';
import { useTagSelectorModal } from '@/features/tag/hooks';
import type { TTagQuery } from '@/features/tag/schemas';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TagItemProps {
    tag: TTagQuery['select'];
    isSelected: boolean;
    onToggle: (tagId: string) => void;
    searchTerm: string;
}

const TagItem = ({ tag, isSelected, onToggle, searchTerm }: TagItemProps) => {
    const isHighlighted = searchTerm && tag.name.toLowerCase().includes(searchTerm.toLowerCase());

    return (
        <div
            className={cn(
                'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50',
                isSelected && 'bg-blue-50 border-blue-200',
                isHighlighted && !isSelected && 'bg-yellow-50 border-yellow-200'
            )}
            onClick={() => onToggle(tag.id)}
        >
            <Checkbox
                checked={isSelected}
                onChange={() => onToggle(tag.id)}
                className="pointer-events-none"
            />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                        {tag.name}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

interface TagSelectorProps {
    className?: string;
}

export const TagSelectorModal = ({ className }: TagSelectorProps) => {
    const { isOpen, tagsIds, transactionId, open, close, setOpen } = useTagSelectorModal();

    const [searchTerm, setSearchTerm] = useState('');
    const [newTagName, setNewTagName] = useState('');

    const { data: tags = [] } = useTagEndpoints.getAll({});
    const createTagMutation = useTagEndpoints.create();

    const filteredTags = useMemo(() => {
        if (!searchTerm) return tags;
        return tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [tags, searchTerm]);

    const selectedTags = useMemo(() => {
        return tags.filter((tag) => tagsIds?.includes(tag.id));
    }, [tags, tagsIds]);

    // =========================
    // Handlers
    // =========================

    const handleToggle = (tagId: string) => {
        // if (value.includes(tagId)) {
        //     onChange(value.filter((id) => id !== tagId));
        // } else {
        //     onChange([...value, tagId]);
        // }
    };

    const handleCreateTag = async () => {
        // if (!newTagName.trim()) return;
        // try {
        //     const newTag = await createTagMutation.mutateAsync({
        //         json: { name: newTagName.trim() },
        //     });
        //     setNewTagName('');
        //     onChange([...value, newTag.id]);
        // } catch (error) {
        //     console.error('Failed to create tag:', error);
        // }
    };

    const handleClearAll = () => {
        // onChange([]);
    };

    const handleSelectAll = () => {
        // const allTagIds = filteredTags.map((tag) => tag.id);
        // onChange([...new Set([...value, ...allTagIds])]);
    };

    return (
        <ResponsiveModal
            open={isOpen}
            onOpenChange={setOpen}
            title="Select Tags"
            description="Choose tags to add additional context to this transaction"
            className={className}
        >
            <div className="space-y-4">
                <Input
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    autoFocus
                />

                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Create new tag..."
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim() || createTagMutation.isPending}
                        size="sm"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {selectedTags.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Selected ({selectedTags.length})
                            </span>
                            <Button variant="ghost" size="sm" onClick={handleClearAll}>
                                Clear All
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {selectedTags.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="default"
                                    className="cursor-pointer"
                                    onClick={() => handleToggle(tag.id)}
                                >
                                    {tag.name} ×
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        Available Tags ({filteredTags.length})
                    </span>
                    {filteredTags.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                            Select All
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-72">
                    <div className="space-y-1">
                        {filteredTags.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm
                                    ? 'No tags found matching your search.'
                                    : 'No tags available.'}
                            </div>
                        ) : (
                            filteredTags.map((tag) => (
                                <TagItem
                                    key={tag.id}
                                    tag={tag}
                                    isSelected={tagsIds?.includes(tag.id) || false}
                                    onToggle={handleToggle}
                                    searchTerm={searchTerm}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </ResponsiveModal>
    );
};
