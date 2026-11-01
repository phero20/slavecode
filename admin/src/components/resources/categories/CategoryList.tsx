"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Eye, Edit, Trash2, Layers, MapPin, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoadmapCategories } from "@/hooks/useResource";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RoadmapCategory } from "@/types/resource";

interface CategoryListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  activeId?: string | null;
}

export function CategoryList({ onEdit, onView }: CategoryListProps) {
  const { categories, isLoading, isError, error, deleteCategory, isDeleting } =
    useRoadmapCategories();
  const [itemToDelete, setItemToDelete] = useState<RoadmapCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories =
    categories
      ?.slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter((category) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          category.categoryId.toLowerCase().includes(query) ||
          category.title.toLowerCase().includes(query)
        );
      }) || [];

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      const targetId = itemToDelete.id || itemToDelete.categoryId;
      await deleteCategory(targetId);
      setItemToDelete(null);
    }
  };

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingMessage="Loading roadmap categories..."
      errorTitle="Failed to load categories"
    >
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="category-search-input"
              type="search"
              placeholder="Search by title or category ID..."
              className="pl-8 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono">
              {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"}
            </Badge>
          </div>
        </div>

        {!filteredCategories || filteredCategories.length === 0 ? (
          <EmptyState
            message={
              searchQuery
                ? `No categories match "${searchQuery}".`
                : "No roadmap categories found. Click 'Create New' to add one."
            }
          />
        ) : (
          <div className="rounded-md border flex-1 min-h-0 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                <TableRow>
                  <TableHead className="w-16 text-center">Order</TableHead>
                  <TableHead>Category Title</TableHead>
                  <TableHead>Category ID (Slug)</TableHead>
                  <TableHead className="text-center">Roadmaps</TableHead>
                  <TableHead className="text-center">Sections</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow
                    key={category.id || category.categoryId}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="text-center font-mono text-xs">
                      <Badge variant="secondary" className="px-2 py-0.5">
                        #{category.order ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {category.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded border">
                        {category.categoryId}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={category.count > 0 ? "default" : "outline"}
                        className="gap-1 font-mono text-xs"
                      >
                        <MapPin className="h-3 w-3" />
                        {category.count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Layers className="h-3 w-3" />
                        {category.sections?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          id={`view-category-${category.categoryId}`}
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            onView(category.id || category.categoryId)
                          }
                          title="View category details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          id={`edit-category-${category.categoryId}`}
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            onEdit(category.id || category.categoryId)
                          }
                          title="Edit category"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          id={`delete-category-${category.categoryId}`}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setItemToDelete(category)}
                          disabled={
                            isDeleting &&
                            itemToDelete?.categoryId === category.categoryId
                          }
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Category Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2 text-left">
              <div>
                Are you sure you want to delete category{" "}
                <span className="font-semibold text-foreground">
                  "{itemToDelete?.title}"
                </span>{" "}
                (
                <span className="font-mono text-xs text-muted-foreground">
                  {itemToDelete?.categoryId}
                </span>
                )?
              </div>

              {(itemToDelete?.count || 0) > 0 && (
                <div className="p-3 border border-destructive/30 bg-destructive/10 rounded-md text-xs text-destructive flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Notice:</span> This
                    category has <strong>{itemToDelete?.count}</strong> active
                    roadmap(s) assigned to it. The system will prevent deletion
                    until all roadmaps are reassigned or removed.
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="cancel-delete-category-btn">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-category-btn"
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryState>
  );
}

