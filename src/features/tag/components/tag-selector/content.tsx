'use client';

import { toast } from '@/components/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTagEndpoints } from '@/features/tag/api';
import { TagListItem } from '@/features/tag/components/tag-selector/tag-list-item';
import { useTagSelectorModal } from '@/features/tag/hooks';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

export const TagSelectorContent = () => {
    const { tagsIds, transactionId, close } = useTagSelectorModal();
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(tagsIds || []);

    const [searchTerm, setSearchTerm] = useState('');

    const { data: tags = [] } = useTagEndpoints.getAll({});
    const createTagMutation = useTagEndpoints.create();
    const assignTagsMutation = useTagEndpoints.assignToTransaction();

    const filteredTags = useMemo(() => {
        if (!searchTerm) return tags;
        return tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [tags, searchTerm]);

    const selectedTags = useMemo(() => {
        return tags.filter((tag) => selectedTagIds.includes(tag.id));
    }, [tags, selectedTagIds]);

    // Check if search term doesn't match any existing tags
    const shouldShowCreateOption = useMemo(() => {
        if (!searchTerm.trim()) return false;
        return !tags.some((tag) => tag.name.toLowerCase() === searchTerm.toLowerCase());
    }, [searchTerm, tags]);

    // =========================
    // Handlers
    // =========================

    const handleToggle = (tagId: string) => {
        setSelectedTagIds((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        );
    };

    const handleCreateTag = async (tagName: string) => {
        if (!tagName.trim()) return;
        try {
            const newTag = await createTagMutation.mutateAsync({
                json: { name: tagName.trim(), color: '#6366f1' },
            });
            // Add the new tag to selection
            setSelectedTagIds((prev) => [...prev, newTag.id]);
            // Clear search term
            setSearchTerm('');
            toast.success(`Tag "${tagName}" created successfully`);
        } catch {
            toast.error('Failed to create tag');
        }
    };

    const handleSave = async () => {
        if (!transactionId) return;

        try {
            await assignTagsMutation.mutateAsync({
                json: {
                    transactionId,
                    tagIds: selectedTagIds,
                },
            });
            toast.success('Tags updated successfully');
            close();
        } catch (error) {
            console.error('Failed to update transaction tags:', error);
            toast.error('Failed to update tags');
        }
    };

    const handleClearAll = () => {
        setSelectedTagIds([]);
    };

    const handleSelectAll = () => {
        const allTagIds = filteredTags.map((tag) => tag.id);
        setSelectedTagIds((prev) => [...new Set([...prev, ...allTagIds])]);
    };

    return (
        <div className="space-y-4">
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
                                variant="outline"
                                style={{ backgroundColor: tag.color }}
                                className="cursor-pointer text-white border-none"
                                onClick={() => handleToggle(tag.id)}
                            >
                                {tag.name} ×
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available Tags ({filteredTags.length})</span>
                {filteredTags.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                        Select All
                    </Button>
                )}
            </div>

            <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                autoFocus
            />

            <ScrollArea className="h-72">
                <div className="space-y-1">
                    {/* Show create option when searching and no exact match */}
                    {shouldShowCreateOption && (
                        <div
                            className="flex items-center space-x-3 p-3 rounded-lg border border-dashed border-primary cursor-pointer hover:bg-primary/5"
                            onClick={() => handleCreateTag(searchTerm)}
                        >
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                                <Plus className="w-3 h-3" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        Create "{searchTerm}"
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {filteredTags.length === 0 && !shouldShowCreateOption ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm
                                ? 'No tags found matching your search.'
                                : 'No tags available.'}
                        </div>
                    ) : (
                        filteredTags.map((tag) => (
                            <TagListItem
                                key={tag.id}
                                tag={tag}
                                isSelected={selectedTagIds.includes(tag.id)}
                                onToggle={handleToggle}
                                searchTerm={searchTerm}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Save/Cancel buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={close}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={assignTagsMutation.isPending}>
                    {assignTagsMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </div>
    );
};
