'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Edit, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { categoriesApi } from '@/lib/api/categories';
import type { CategoryResponse } from '@/types';
import * as Icons from 'lucide-react';

interface CategoryCardProps {
  category: CategoryResponse;
  onEdit?: (category: CategoryResponse) => void;
  onDelete?: () => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await categoriesApi.delete(category._id);
      toast.success('Category deleted successfully');
      setShowDeleteDialog(false);
      onDelete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get the icon component dynamically
  const getIconComponent = (iconName: string) => {
    // Convert icon name to PascalCase (e.g., 'shopping-cart' -> 'ShoppingCart')
    const pascalCase = iconName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    // @ts-expect-error - Dynamic icon lookup
    const IconComponent = Icons[pascalCase] || Icons.Circle;
    return IconComponent;
  };

  const IconComponent = getIconComponent(category.icon);

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="flex items-center justify-center h-10 w-10 rounded-full"
                style={{ backgroundColor: category.color + '20' }}
              >
                <IconComponent className="h-5 w-5" style={{ color: category.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{category.name}</h3>
                  {category.isSystem && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Lock className="h-3 w-3" />
                      System
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground capitalize">{category.type}</p>
              </div>
            </div>

            {!category.isSystem && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(category)}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit category</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete category</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{category.name}&rdquo;? This action cannot be undone.
              Transactions using this category will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
