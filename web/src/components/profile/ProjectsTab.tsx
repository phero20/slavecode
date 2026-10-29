"use client";

import React from "react";
import Link from "next/link";
import { FolderGit2, Plus, Clock, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ProjectCard } from "@/components/projects/project-card";
import { RoadmapProjectsSkeleton } from "@/components/skeletons/ProjectsSkeletons";
import { useProjectPagination } from "@/hooks/use-project-pagination";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProjectsTabProps {
  username: string;
}

interface StatusFilterItem {
  label: string;
  value?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const STATUS_FILTERS: StatusFilterItem[] = [
  { label: "All", value: undefined, icon: FolderGit2 },
  { label: "Approved", value: "approved", icon: CheckCircle2 },
  { label: "Pending", value: "pending", icon: Clock },
  { label: "Updated", value: "updated", icon: RefreshCw },
  { label: "Rejected", value: "rejected", icon: AlertCircle },
];

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ username }) => {
  const {
    items: projects,
    isLoading,
    isFetching,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    isOwner,
    statusFilter,
    setStatusFilter,
  } = useProjectPagination(username, 6);

  const expectedCount = totalCount > 0
    ? Math.min(6, totalCount - (currentPage - 1) * 6)
    : 6;

  return (
    <div className="space-y-6">
      {/* Tab Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-primary" />
            <span>COMMUNITY PROJECTS</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">
            {isOwner
              ? "projects ideas created and submitted by you"
              : `projects ideas published by ${username}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Link href="/projects/new">
              <Button
                id="profile-create-project-btn"
                size="sm"
                className="font-bold tracking-tight gap-1.5 h-9"
              >
                <Plus className="size-4" />
                <span>Create Project</span>
              </Button>
            </Link>
          )}
          <Badge variant="secondary" className="p-2 text-xs font-bold">
            {totalCount} TOTAL PROJECTS
          </Badge>
        </div>
      </div>

      <Tabs
        value={statusFilter || "all"}
        onValueChange={(val) => setStatusFilter(val === "all" ? undefined : val)}
        className="w-full space-y-6"
      >
        {/* Author Status Filter Tabs (Only visible to the project author) */}
        {isOwner && (
          <div className="w-full overflow-x-auto pb-1">
            <TabsList className="p-1 h-auto w-max flex justify-start items-center gap-1 border">
              {STATUS_FILTERS.map((f) => {
                const Icon = f.icon;
                const val = f.value || "all";
                return (
                  <TabsTrigger
                    key={f.label}
                    id={`filter-project-${f.label.toLowerCase()}-tab`}
                    value={val}
                    className="data-[state=active]:text-primary h-9 px-3.5 sm:px-4 gap-1.5 font-bold text-xs shrink-0"
                  >
                    {Icon && <Icon className="size-3.5" />}
                    <span>{f.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        )}

        <TabsContent value={statusFilter || "all"} className="focus-visible:ring-0 mt-0">
          {/* QueryGuard Data Boundary */}
          <QueryGuard
            loading={isLoading || (isFetching && projects.length === 0)}
            error={error}
            data={projects}
            onRetry={refetch}
            skeleton={<RoadmapProjectsSkeleton count={expectedCount} />}
            emptyIcon={FolderGit2}
            emptyTitle={isOwner ? "No Projects Created Yet" : "No Projects Published"}
            emptyMessage={
              isOwner
                ? statusFilter
                  ? `You don't have any projects in '${statusFilter}' status.`
                  : "You haven't submitted any hands-on roadmap projects yet. Share your project with the developer community!"
                : `${username} hasn't created any projects yet, or their submitted projects haven't been approved yet.`
            }
            emptyAction={
              isOwner ? (
                <Link href="/projects/new">
                  <Button
                    id="profile-submit-first-project-btn"
                    size="sm"
                    className="font-bold tracking-tight gap-1.5 mt-2"
                  >
                    <Plus className="size-4" />
                    <span>Create Project</span>
                  </Button>
                </Link>
              ) : undefined
            }
          >
            {(projectList) => (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {projectList.map((project, idx) => (
                    <ProjectCard
                      key={project.id || project.slug || idx}
                      project={project}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {(totalPages > 1 || isLoading) && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            if (currentPage > 1) setCurrentPage((p) => p - 1);
                          }}
                          className={cn(
                            "cursor-pointer",
                            currentPage === 1 &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>

                      {!isLoading &&
                        Array.from({ length: totalPages }).map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={currentPage === page}
                                  onClick={() => setCurrentPage(page)}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            if (currentPage < totalPages)
                              setCurrentPage((p) => p + 1);
                          }}
                          className={cn(
                            "cursor-pointer",
                            currentPage === totalPages &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </QueryGuard>
        </TabsContent>
      </Tabs>
    </div>
  );
};
