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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTagEndpoints } from '@/features/tag/api';
import { TagDetailsView } from '@/features/tag/components/tag-details-view';
import { TagForm } from '@/features/tag/components/tag-form';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
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

    const { data: tags = [] } = useTagEndpoints.getAll({});
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

    const handleEdit = (tagId: string) => {
        setEditingTagId(tagId);
        setIsFormOpen(true);
        setSelectedTagId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Tags</h1>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Tag
                </Button>
            </div>

            <div className="flex gap-4">
                <Input
                    placeholder="Search tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-[180px]">
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
                    <Card
                        key={tag.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        style={{
                            borderLeft: `4px solid ${tag.color}`,
                        }}
                        onClick={() => setSelectedTagId(tag.id)}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{tag.name}</span>
                            <span className="text-sm text-muted-foreground">
                                {tag.transactionCount || 0} transactions
                            </span>
                        </div>
                    </Card>
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
            <TagForm
                tagId={editingTagId}
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingTagId(undefined);
                }}
            />

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
