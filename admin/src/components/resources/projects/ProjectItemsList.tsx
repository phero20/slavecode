"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  XCircle,
  MoreVertical,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  FilterX,
  RefreshCw,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useAdminProjects,
  useAdminProjectStats,
  useAdminProjectMutations,
} from "@/hooks/useRoadmapProject";
import { useDeveloperRoadmaps } from "@/hooks/useResource";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  RoadmapProject,
  AdminProjectStatus,
  AdminProjectOrigin,
  AdminProjectDifficulty,
  AdminProjectSort,
} from "@/types/roadmap-project";

interface ProjectItemsListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  activeId?: string | null;
}

export function ProjectItemsList({ onEdit, onView }: ProjectItemsListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<AdminProjectSort>("newest");
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Filters passed to the backend query
  const queryFilter = {
    search: debouncedSearch || undefined,
    status:
      selectedStatus !== "all"
        ? (selectedStatus as AdminProjectStatus)
        : undefined,
    origin:
      selectedOrigin !== "all"
        ? (selectedOrigin as AdminProjectOrigin)
        : undefined,
    difficulty:
      selectedDifficulty !== "all"
        ? (selectedDifficulty as AdminProjectDifficulty)
        : undefined,
    roadmapSlug: selectedRoadmap !== "all" ? selectedRoadmap : undefined,
    sort: selectedSort,
    page,
    limit: pageSize,
  };

  const { projects, pagination, isLoading, isFetching, isError, error, refetch } = useAdminProjects(queryFilter);
  const { stats, refetch: refetchStats } = useAdminProjectStats();
  const { roadmaps } = useDeveloperRoadmaps();
  const { moderateProject, deleteProject, isModerating, isDeleting } =
    useAdminProjectMutations();

  // Modals state
  const [itemToDelete, setItemToDelete] = useState<RoadmapProject | null>(null);
  const [itemToReject, setItemToReject] = useState<RoadmapProject | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const handleApprove = async (slugOrId: string) => {
    await moderateProject({
      slugOrId,
      payload: { status: "approved" },
    });
  };

  const handleOpenRejectModal = (item: RoadmapProject) => {
    setItemToReject(item);
    setRejectionReason(item.review?.rejectionReason || "");
    setAdminNotes(item.review?.adminNotes || "");
  };

  const handleConfirmReject = async () => {
    if (!itemToReject) return;
    await moderateProject({
      slugOrId: itemToReject.id,
      payload: {
        status: "rejected",
        rejectionReason:
          rejectionReason.trim() || "Does not meet project quality standards",
        adminNotes: adminNotes.trim() || undefined,
      },
    });
    setItemToReject(null);
    setRejectionReason("");
    setAdminNotes("");
  };

  const handleStatusChange = async (
    slugOrId: string,
    status: AdminProjectStatus
  ) => {
    if (status === "rejected") {
      const target = projects.find(
        (p) => p.id === slugOrId || p.slug === slugOrId
      );
      if (target) handleOpenRejectModal(target);
      return;
    }
    await moderateProject({
      slugOrId,
      payload: { status },
    });
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteProject(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedStatus("all");
    setSelectedOrigin("all");
    setSelectedDifficulty("all");
    setSelectedRoadmap("all");
    setSelectedSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch || searchInput) ||
    selectedStatus !== "all" ||
    selectedOrigin !== "all" ||
    selectedDifficulty !== "all" ||
    selectedRoadmap !== "all" ||
    selectedSort !== "newest";

  const getStatusBadge = (status: AdminProjectStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="gap-1 font-normal text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1 font-normal text-xs">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1 font-normal text-xs">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground gap-1 font-normal text-xs"
          >
            <Archive className="h-3 w-3" />
            Archived
          </Badge>
        );
      case "updated":
        return (
          <Badge variant="secondary" className="gap-1 font-normal text-xs">
            <RefreshCw className="h-3 w-3" />
            Updated
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: AdminProjectDifficulty) => {
    switch (difficulty) {
      case "beginner":
        return (
          <Badge variant="outline" className="text-[11px] font-mono">
            Beginner
          </Badge>
        );
      case "intermediate":
        return (
          <Badge variant="secondary" className="text-[11px] font-mono">
            Intermediate
          </Badge>
        );
      case "advanced":
        return (
          <Badge variant="default" className="text-[11px] font-mono">
            Advanced
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] font-mono">
            {difficulty}
          </Badge>
        );
    }
  };

  const getOriginBadge = (origin: AdminProjectOrigin) => {
    if (origin === "community") {
      return (
        <Badge variant="outline" className="text-[11px] font-mono">
          Community
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[11px] font-mono">
        Official
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 shrink-0">
          <div
            id="stat-filter-all"
            onClick={() => {
              setSelectedStatus("all");
              setPage(1);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedStatus === "all" && selectedOrigin === "all"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted/20 border-border hover:bg-muted/40"
            }`}
          >
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-bold text-sm text-foreground font-mono">
              {stats?.total ?? 0}
            </span>
          </div>

          <div
            id="stat-filter-pending"
            onClick={() => {
              setSelectedStatus("pending");
              setPage(1);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedStatus === "pending"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted/20 border-border hover:bg-muted/40"
            }`}
          >
            <span className="text-xs text-muted-foreground">Pending</span>
            <span className="font-bold text-sm text-foreground font-mono">
              {stats?.pending ?? 0}
            </span>
          </div>

          <div
            id="stat-filter-approved"
            onClick={() => {
              setSelectedStatus("approved");
              setPage(1);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedStatus === "approved"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted/20 border-border hover:bg-muted/40"
            }`}
          >
            <span className="text-xs text-muted-foreground">Approved</span>
            <span className="font-bold text-sm text-foreground font-mono">
              {stats?.approved ?? 0}
            </span>
          </div>

          <div
            id="stat-filter-rejected"
            onClick={() => {
              setSelectedStatus("rejected");
              setPage(1);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedStatus === "rejected"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted/20 border-border hover:bg-muted/40"
            }`}
          >
            <span className="text-xs text-muted-foreground">Rejected</span>
            <span className="font-bold text-sm text-foreground font-mono">
              {stats?.rejected ?? 0}
            </span>
          </div>

          <div
            id="stat-filter-community"
            onClick={() => {
              setSelectedOrigin("community");
              setPage(1);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedOrigin === "community"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted/20 border-border hover:bg-muted/40"
            }`}
          >
            <span className="text-xs text-muted-foreground">Community</span>
            <span className="font-bold text-sm text-foreground font-mono">
              {stats?.community ?? 0}
            </span>
          </div>

          <div
            id="stat-filter-official"
            onClick={() => {
              setSelectedOrigin("official");
              setPage(1);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedOrigin === "official"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted/20 border-border hover:bg-muted/40"
            }`}
          >
            <span className="text-xs text-muted-foreground">Official</span>
            <span className="font-bold text-sm text-foreground font-mono">
              {stats?.official ?? 0}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="project-search-input"
              type="search"
              placeholder="Search by title, slug, submitter..."
              className="pl-8 pr-8 bg-transparent"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isFetching && (
              <Loader2 className="absolute right-2.5 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger id="project-status-select" className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
            </SelectContent>
          </Select>

          {/* Origin Filter */}
          <Select
            value={selectedOrigin}
            onValueChange={(val) => {
              setSelectedOrigin(val);
              setPage(1);
            }}
          >
            <SelectTrigger id="project-origin-select" className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Origins</SelectItem>
              <SelectItem value="official">Official</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select
            value={selectedDifficulty}
            onValueChange={(val) => {
              setSelectedDifficulty(val);
              setPage(1);
            }}
          >
            <SelectTrigger id="project-difficulty-select" className="w-[135px] h-9 text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          {/* Roadmap Filter */}
          <Select
            value={selectedRoadmap}
            onValueChange={(val) => {
              setSelectedRoadmap(val);
              setPage(1);
            }}
          >
            <SelectTrigger id="project-roadmap-select" className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="All Roadmaps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roadmaps</SelectItem>
              {roadmaps.map((r) => (
                <SelectItem key={r.id || r.slug} value={r.slug}>
                  {r.title?.card || r.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={selectedSort}
            onValueChange={(val) => {
              setSelectedSort(val as AdminProjectSort);
              setPage(1);
            }}
          >
            <SelectTrigger id="project-sort-select" className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="upvotes">Most Upvoted</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              id="reset-project-filters-btn"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}

          <Button
            id="refresh-projects-btn"
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              refetchStats();
            }}
            className="h-9 px-2.5 text-xs ml-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Table Content */}
        <QueryState
          isLoading={isLoading && !projects.length}
          isError={isError}
          error={error}
          loadingMessage="Loading roadmap projects..."
          errorTitle="Failed to load projects"
        >
          <div className={`flex-1 min-h-0 border rounded-lg overflow-auto bg-card transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[280px]">Project</TableHead>
                <TableHead className="w-[120px]">Difficulty</TableHead>
                <TableHead className="w-[180px]">Roadmaps</TableHead>
                <TableHead className="w-[100px]">Origin</TableHead>
                <TableHead className="w-[180px]">Submitter</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[110px]">Stats</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <EmptyState
                      message={
                        hasActiveFilters
                          ? "No roadmap projects match the selected filters."
                          : "No roadmap projects exist yet. Click 'Create Project' above to add one."
                      }
                      className="border-0 shadow-none py-12"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const submitter = project.submittedBy;
                  const isApproved = project.status === "approved";
                  const isPending = project.status === "pending";

                  return (
                    <TableRow key={project.id || project.slug} className="group">
                      {/* Project Title & Slug */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-sm text-foreground line-clamp-1">
                            {project.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-mono text-[11px]">
                              /{project.slug}
                            </span>
                            {project.type && (
                              <>
                                <span>•</span>
                                <span>{project.type}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Difficulty */}
                      <TableCell>
                        {getDifficultyBadge(project.difficulty)}
                      </TableCell>

                      {/* Roadmaps */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[170px]">
                          {project.roadmapIds?.length > 0 ? (
                            project.roadmapIds.slice(0, 2).map((rm) => (
                              <Badge
                                key={rm}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 font-mono"
                              >
                                {rm}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          )}
                          {(project.roadmapIds?.length || 0) > 2 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-mono text-muted-foreground"
                            >
                              +{project.roadmapIds.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Origin */}
                      <TableCell>{getOriginBadge(project.origin)}</TableCell>

                      {/* Submitter */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={submitter?.avatarUrl || undefined}
                              alt={submitter?.username || "Submitter"}
                            />
                            <AvatarFallback className="text-[10px]">
                              {(submitter?.username?.[0] || "U").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium truncate">
                              {submitter?.fullName ||
                                submitter?.username ||
                                (project.origin === "official"
                                  ? "Official Team"
                                  : "Anonymous")}
                            </span>
                            {submitter?.username && (
                              <span className="text-[10px] text-muted-foreground truncate">
                                @{submitter.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(project.status)}</TableCell>

                      {/* Stats */}
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span title="Started" className="flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" />
                            {project.stats?.startedCount ?? 0}
                          </span>
                          <span title="Completed" className="flex items-center gap-0.5">
                            <Award className="h-3 w-3" />
                            {project.stats?.completedCount ?? 0}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Approve button if pending/rejected */}
                          {!isApproved && (
                            <Button
                              id={`approve-project-btn-${project.id}`}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                              title="Approve Project"
                              onClick={() => handleApprove(project.id)}
                              disabled={isModerating}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Quick Reject button if pending */}
                          {isPending && (
                            <Button
                              id={`reject-project-btn-${project.id}`}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Reject Project"
                              onClick={() => handleOpenRejectModal(project)}
                              disabled={isModerating}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}

                          {/* View details */}
                          <Button
                            id={`view-project-btn-${project.id}`}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="View Project"
                            onClick={() => onView(project.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit project */}
                          <Button
                            id={`edit-project-btn-${project.id}`}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit Project"
                            onClick={() => onEdit(project.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* More dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              id={`more-menu-project-btn-${project.id}`}
                              asChild
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs">
                                Moderation State
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                id={`set-approved-${project.id}`}
                                onClick={() =>
                                  handleStatusChange(project.id, "approved")
                                }
                                disabled={project.status === "approved"}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-primary" />
                                Set Approved
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                id={`set-pending-${project.id}`}
                                onClick={() =>
                                  handleStatusChange(project.id, "pending")
                                }
                                disabled={project.status === "pending"}
                              >
                                <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                Set Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                id={`set-rejected-${project.id}`}
                                onClick={() => handleOpenRejectModal(project)}
                                disabled={project.status === "rejected"}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-2 text-destructive" />
                                Set Rejected...
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                id={`set-archived-${project.id}`}
                                onClick={() =>
                                  handleStatusChange(project.id, "archived")
                                }
                                disabled={project.status === "archived"}
                              >
                                <Archive className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                Set Archived
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                id={`delete-project-menu-btn-${project.id}`}
                                className="text-destructive focus:text-destructive"
                                onClick={() => setItemToDelete(project)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        </QueryState>

        {/* Pagination & Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2 pt-1 shrink-0">
            <div>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, pagination.total)} of{" "}
              {pagination.total} projects
            </div>
            <div className="flex items-center gap-2">
              <Button
                id="prev-page-btn"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="font-mono px-2">
                {page} / {pagination.totalPages}
              </span>
              <Button
                id="next-page-btn"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={page >= pagination.totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        <Dialog
          open={Boolean(itemToReject)}
          onOpenChange={(open) => {
            if (!open) {
              setItemToReject(null);
              setRejectionReason("");
              setAdminNotes("");
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Reject Project Submission
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide a reason why this project is being rejected. This reason
                will be shared with the author.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted/30 rounded-lg border text-xs space-y-1">
                <div className="font-semibold text-foreground">
                  {itemToReject?.title}
                </div>
                <div className="text-muted-foreground font-mono">
                  /{itemToReject?.slug}
                </div>
                {itemToReject?.submittedBy?.username && (
                  <div className="text-muted-foreground">
                    Author: @{itemToReject.submittedBy.username}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reject-reason-input" className="text-xs">
                  Rejection Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reject-reason-input"
                  placeholder="Explain why this project does not meet guidelines (e.g., incomplete requirements, broken instructions, duplicate project)..."
                  className="h-24 resize-none text-xs"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reject-notes-input" className="text-xs">
                  Internal Admin Notes (Optional)
                </Label>
                <Textarea
                  id="reject-notes-input"
                  placeholder="Notes for staff review only..."
                  className="h-16 resize-none text-xs"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                id="cancel-reject-btn"
                variant="outline"
                size="sm"
                onClick={() => setItemToReject(null)}
                disabled={isModerating}
              >
                Cancel
              </Button>
              <Button
                id="confirm-reject-btn"
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
                disabled={isModerating || !rejectionReason.trim()}
              >
                {isModerating ? "Rejecting..." : "Reject Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog
          open={Boolean(itemToDelete)}
          onOpenChange={(open) => !open && setItemToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-semibold">
                Delete Project
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  &quot;{itemToDelete?.title}&quot;
                </span>
                ? This action cannot be undone and will remove the project from
                all roadmaps and member tracking.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                id="cancel-delete-project-btn"
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                id="confirm-delete-project-btn"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}

