"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Trash2, Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
import { useDeleteProject } from "@/hooks/mutations/use-project.mutations";
import { VoteControl } from "@/components/shared/VoteControl";
import type { RoadmapProjectItem } from "@/types/project";

export function ProjectHeader({ project }: { project: RoadmapProjectItem }) {
  const router = useRouter();
  const { user } = useUser();
  const { backendUser, isLoading: isUserLoading } = useCurrentUser();
  const deleteProjectMutation = useDeleteProject();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Author match: supports Postgres UUIDs and Clerk user session synchronously
  const isAuthor = Boolean(
    (backendUser?.id && project.submittedBy?.userId && backendUser.id === project.submittedBy.userId) ||
    (backendUser?.username && project.submittedBy?.username && backendUser.username === project.submittedBy.username) ||
    (user?.id && project.submittedBy?.userId && user.id === project.submittedBy.userId) ||
    (user?.username && project.submittedBy?.username && user.username === project.submittedBy.username)
  );

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.slug);
      setDialogOpen(false);
      router.push("/projects");
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Nav Row: Back Link on Left & Author Details/Actions on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
        {/* Left: Back Link */}
        <Link
          id="back-to-projects-btn"
          href="/projects"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group w-fit"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to all projects</span>
        </Link>

        {/* Right: Author Detail & Edit/Delete Actions */}
        <div className="flex items-center flex-wrap gap-3 sm:justify-end">
          {project.submittedBy?.username ? (
            <Link
              id="project-author-link"
              href={`/u/${project.submittedBy.username}`}
              className="group flex items-center gap-2.5 cursor-pointer"
            >
              <Avatar className="size-8 sm:size-9 border border-border shrink-0">
                {project.submittedBy.avatarUrl && (
                  <AvatarImage
                    src={project.submittedBy.avatarUrl}
                    alt={project.submittedBy.fullName || project.submittedBy.username}
                  />
                )}
                <AvatarFallback className="text-xs font-bold uppercase bg-primary/10 text-primary">
                  {(project.submittedBy.fullName?.[0] || project.submittedBy.username[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {project.submittedBy.fullName || project.submittedBy.username}
                </span>
                <span className="text-[11px] text-muted-foreground hover:underline">
                  {project.submittedBy.username}
                </span>
              </div>
            </Link>
          ) : null}

          {isAuthor ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link id="edit-project-btn" href={`/projects/${project.slug}/edit`}>
                  <Edit3 className="size-3.5 text-primary" />
                  <span>Edit Project</span>
                </Link>
              </Button>

              <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    id="delete-project-btn"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <span className="font-semibold text-foreground">"{project.title}"</span>? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteProjectMutation.isPending}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      id="confirm-delete-project-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                      disabled={deleteProjectMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : isUserLoading && user ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 rounded-md bg-muted/60 animate-pulse" />
              <div className="h-8 w-18 rounded-md bg-muted/60 animate-pulse" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Pending / Updated Approval Alert */}
      {(project.status === "pending" || project.status === "updated") && (
        <Alert
          id="project-pending-banner"
          className="border-border bg-card [&>svg]:text-primary"
        >
          <Clock className="h-4 w-4 text-primary" />
          <AlertTitle className="font-semibold text-primary">
            {project.status === "updated" ? "Changes Under Review" : "Pending Admin Review"}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {project.status === "updated"
              ? "Your recent updates have been saved and are awaiting admin review. This project will not be visible to other users until approved."
              : "This project is currently pending admin approval and is not visible to other users yet."}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Title */}
          <h1
            id="project-detail-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] wrap-break-word"
          >
            {project.title}
          </h1>

          {/* Subtitle / Description */}
          {project.description && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl wrap-break-word">
              {project.description}
            </p>
          )}
        </div>

        {/* Community Score / Vote Control */}
        <VoteControl
          targetType="project"
          targetId={project.slug}
          size="default"
          className="shrink-0 sm:mt-1 self-start"
        />
      </div>
    </div>
  );
}
