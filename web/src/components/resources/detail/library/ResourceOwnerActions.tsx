"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit3, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteResource } from "@/hooks/mutations/use-roadmap-resource.mutations";
import type { RoadmapResourceItem } from "@/types/roadmap-resource";

export function isResourceAuthor(
  resource: RoadmapResourceItem,
  backendUser?: { id?: string; username?: string } | null,
  clerkUser?: { id?: string; username?: string | null } | null
): boolean {
  return Boolean(
    (backendUser?.id &&
      resource.submittedBy?.userId &&
      backendUser.id === resource.submittedBy.userId) ||
      (backendUser?.username &&
        resource.submittedBy?.username &&
        backendUser.username === resource.submittedBy.username) ||
      (clerkUser?.id &&
        resource.submittedBy?.userId &&
        clerkUser.id === resource.submittedBy.userId) ||
      (clerkUser?.username &&
        resource.submittedBy?.username &&
        clerkUser.username === resource.submittedBy.username)
  );
}

export function ResourceOwnerActions({
  resource,
}: {
  resource: RoadmapResourceItem;
}) {
  const { user } = useUser();
  const { backendUser, isLoading: isUserLoading } = useCurrentUser();
  const deleteResourceMutation = useDeleteResource();
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAuthor = isResourceAuthor(resource, backendUser, user);

  if (!resource.id || resource.origin === "official") {
    return null;
  }

  if (!isAuthor) {
    if (isUserLoading && user) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-md bg-muted/60 animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-muted/60 animate-pulse" />
        </div>
      );
    }
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteResourceMutation.mutateAsync(resource.id);
      setDialogOpen(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
        <Link
          id={`edit-resource-btn-${resource.id}`}
          href={`/resources/edit/${resource.id}`}
        >
          <Edit3 className="size-3.5 text-primary" />
          <span>Edit</span>
        </Link>
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            id={`delete-resource-btn-${resource.id}`}
            variant="outline"
            size="sm"
            className="h-8 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{resource.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteResourceMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              id={`confirm-delete-resource-btn-${resource.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteResourceMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteResourceMutation.isPending
                ? "Deleting..."
                : "Delete Resource"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
