'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTagEndpoints } from '@/features/tag/api';
import { TagCard, TagCardSkeleton } from '@/features/tag/components/tag-card';
import { TagDetailsView } from '@/features/tag/components/tag-details-view';
import { TagUpsertModal } from '@/features/tag/components/tag-upsert';
import { useTagUpsertModal } from '@/features/tag/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

type SortOption = 'popular' | 'recent' | 'created' | 'alpha' | 'color';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'recent', label: 'Recently Used' },
    { value: 'created', label: 'Creation Date' },
    { value: 'alpha', label: 'Alphabetical' },
    { value: 'color', label: 'By Color' },
];

export function TagManager() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('alpha');
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTagId, setEditingTagId] = useState<string>();
    const [deleteTagId, setDeleteTagId] = useState<string>();
    const { openModal, isModalOpen, modalView } = useTagUpsertModal();

    const { data: tags = [], isLoading } = useTagEndpoints.getAll({});
    const deleteMutation = useTagEndpoints.delete();

    const sortedAndFilteredTags = useMemo(() => {
        let filtered = tags;

        // Apply search filter
        if (search) {
            filtered = filtered.filter((tag) =>
                tag.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Apply sorting
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return (b.transactionCount || 0) - (a.transactionCount || 0);
                case 'recent':
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                case 'created':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'color':
                    return a.color.localeCompare(b.color);
                case 'alpha':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [tags, search, sortBy]);

    const handleDelete = async (tagId: string) => {
        try {
            await deleteMutation.mutateAsync({ param: { id: tagId } });
            await queryClient.invalidateQueries({ queryKey: ['tags'] });
            setDeleteTagId(undefined);
            setSelectedTagId(null);
        } catch (error) {
            console.error('Failed to delete tag:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <TagCardSkeleton />
                <TagCardSkeleton />
                <TagCardSkeleton />
            </div>
        );
    }

    const handleEdit = (tagId: string) => {
        setEditingTagId(tagId);
        setIsFormOpen(true);
        setSelectedTagId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Input
                    placeholder="Search tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm bg-white"
                />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedAndFilteredTags.map((tag) => (
                    <TagCard key={tag.id} tag={tag} onClick={() => setSelectedTagId(tag.id)} />
                ))}

                {sortedAndFilteredTags.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        {search
                            ? 'No tags found matching your search.'
                            : 'No tags available. Create your first tag!'}
                    </div>
                )}
            </div>

            {/* Tag Details Modal */}
            <TagDetailsView
                tagId={selectedTagId}
                onClose={() => setSelectedTagId(null)}
                onEdit={handleEdit}
                onDelete={setDeleteTagId}
            />

            {/* Tag Form Modal */}
            <TagUpsertModal />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTagId} onOpenChange={() => setDeleteTagId(undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this tag? This action cannot be undone.
                            The tag will be removed from all associated transactions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteTagId && handleDelete(deleteTagId)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
