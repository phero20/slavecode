"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Archive,
  XCircle,
  MoreVertical,
  Video,
  FileText,
  BookOpen,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
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
  useAdminResources,
  useAdminResourceStats,
  useAdminResourceMutations,
} from "@/hooks/useRoadmapResource";
import { useDeveloperRoadmaps } from "@/hooks/useResource";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  RoadmapResource,
  AdminResourceStatus,
  AdminResourceOrigin,
} from "@/types/roadmap-resource";

interface ResourceItemsListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  activeId?: string | null;
}

export function ResourceItemsList({ onEdit, onView }: ResourceItemsListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
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
        ? (selectedStatus as AdminResourceStatus)
        : undefined,
    origin:
      selectedOrigin !== "all"
        ? (selectedOrigin as AdminResourceOrigin)
        : undefined,
    roadmapSlug: selectedRoadmap !== "all" ? selectedRoadmap : undefined,
    type: selectedType !== "all" ? selectedType : undefined,
    page,
    limit: pageSize,
  };

  const { resources, pagination, isLoading, isFetching, isError, error } = useAdminResources(queryFilter);
  const { stats } = useAdminResourceStats();
  const { roadmaps } = useDeveloperRoadmaps();
  const { moderateResource, deleteResource, isModerating, isDeleting } =
    useAdminResourceMutations();

  // Modals state
  const [itemToDelete, setItemToDelete] = useState<RoadmapResource | null>(null);
  const [itemToReject, setItemToReject] = useState<RoadmapResource | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const handleApprove = async (id: string) => {
    await moderateResource({
      id,
      payload: { status: "approved" },
    });
  };

  const handleOpenRejectModal = (item: RoadmapResource) => {
    setItemToReject(item);
    setRejectionReason(item.review?.rejectionReason || "");
    setAdminNotes(item.review?.adminNotes || "");
  };

  const handleConfirmReject = async () => {
    if (!itemToReject) return;
    await moderateResource({
      id: itemToReject.id,
      payload: {
        status: "rejected",
        rejectionReason: rejectionReason.trim() || "Does not meet quality standards",
        adminNotes: adminNotes.trim() || undefined,
      },
    });
    setItemToReject(null);
    setRejectionReason("");
    setAdminNotes("");
  };

  const handleStatusChange = async (
    id: string,
    status: AdminResourceStatus
  ) => {
    if (status === "rejected") {
      const target = resources.find((r) => r.id === id);
      if (target) handleOpenRejectModal(target);
      return;
    }
    await moderateResource({
      id,
      payload: { status },
    });
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteResource(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const getStatusBadge = (status: AdminResourceStatus) => {
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOriginBadge = (origin: AdminResourceOrigin) => {
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
            onClick={() => setSelectedStatus("all")}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedStatus === "all"
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
            onClick={() => setSelectedStatus("pending")}
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
            onClick={() => setSelectedStatus("approved")}
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
            onClick={() => setSelectedStatus("rejected")}
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
            onClick={() => setSelectedOrigin("community")}
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
            onClick={() => setSelectedOrigin("official")}
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
              id="resource-search-input"
              type="search"
              placeholder="Search by title, author, URL, or submitter..."
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
            <SelectTrigger
              id="resource-status-filter"
              className="w-[140px] bg-transparent text-xs"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
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
            <SelectTrigger
              id="resource-origin-filter"
              className="w-[130px] bg-transparent text-xs"
            >
              <SelectValue placeholder="Origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Origins</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="official">Official</SelectItem>
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
            <SelectTrigger
              id="resource-roadmap-filter"
              className="w-[160px] bg-transparent text-xs"
            >
              <SelectValue placeholder="Roadmap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roadmaps</SelectItem>
              {roadmaps?.map((rm) => (
                <SelectItem key={rm.slug} value={rm.slug}>
                  {rm.title?.card || rm.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={selectedType}
            onValueChange={(val) => {
              setSelectedType(val);
              setPage(1);
            }}
          >
            <SelectTrigger
              id="resource-type-filter"
              className="w-[130px] bg-transparent text-xs"
            >
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="YouTube Playlist">YouTube Playlist</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Course">Course</SelectItem>
              <SelectItem value="Article">Article</SelectItem>
              <SelectItem value="Documentation">Documentation</SelectItem>
              <SelectItem value="Book">Book</SelectItem>
            </SelectContent>
          </Select>

          {/* Total badge */}
          <Badge variant="outline" className="font-mono text-xs ml-auto">
            {pagination.total} {pagination.total === 1 ? "item" : "items"}
          </Badge>
        </div>

        {/* Data Table */}
        <QueryState
          isLoading={isLoading && !resources.length}
          isError={isError}
          error={error}
          loadingMessage="Loading learning resources..."
          errorTitle="Failed to load resources"
        >
          {!resources || resources.length === 0 ? (
            <EmptyState
              message={
                debouncedSearch ||
              selectedStatus !== "all" ||
              selectedOrigin !== "all" ||
              selectedRoadmap !== "all" ||
              selectedType !== "all"
                ? "No learning resources match the selected filters."
                : "No learning resources found. Click 'Create New' to add one."
            }
          />
        ) : (
          <div className={`rounded-md border flex-1 min-h-0 overflow-auto transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                <TableRow>
                  <TableHead className="min-w-[240px]">Resource</TableHead>
                  <TableHead>Type & Origin</TableHead>
                  <TableHead>Roadmaps</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((item) => {
                  const submitter = item.submittedBy;

                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      {/* Resource details */}
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-12 h-8 rounded object-cover border shrink-0 bg-muted"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded border shrink-0 bg-muted flex items-center justify-center text-muted-foreground">
                              {item.type.toLowerCase().includes("video") ? (
                                <Video className="h-4 w-4" />
                              ) : item.type.toLowerCase().includes("course") ? (
                                <BookOpen className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-foreground line-clamp-1">
                              {item.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.author && (
                                <span className="text-xs text-muted-foreground">
                                  by <span className="text-foreground">{item.author}</span>
                                </span>
                              )}
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 hover:underline"
                                title="Open resource link"
                              >
                                Link
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type & Origin */}
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-mono capitalize"
                          >
                            {item.type}
                          </Badge>
                          {getOriginBadge(item.origin)}
                        </div>
                      </TableCell>

                      {/* Roadmaps */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {item.roadmapIds && item.roadmapIds.length > 0 ? (
                            item.roadmapIds.map((rid) => (
                              <span
                                key={rid}
                                className="text-[11px] font-mono bg-muted text-foreground px-1.5 py-0.5 rounded border"
                              >
                                {rid}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              None
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Submitter */}
                      <TableCell>
                        {item.origin === "community" && submitter ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              {submitter.avatarUrl && (
                                <AvatarImage
                                  src={submitter.avatarUrl}
                                  alt={submitter.username || "User"}
                                />
                              )}
                              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                {submitter.username?.slice(0, 2).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <div className="font-medium text-foreground">
                                @{submitter.username || "anonymous"}
                              </div>
                              {submitter.submittedAt && (
                                <div className="text-[10px] text-muted-foreground">
                                  {new Date(submitter.submittedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Official Team
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        {getStatusBadge(item.status)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          {/* Quick Approve button if pending */}
                          {item.status === "pending" && (
                            <Button
                              id={`approve-btn-${item.id}`}
                              size="icon"
                              variant="ghost"
                              onClick={() => handleApprove(item.id)}
                              title="Approve immediately"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            id={`view-resource-${item.id}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(item.id)}
                            title="View resource details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            id={`edit-resource-${item.id}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item.id)}
                            title="Edit resource"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Quick Status Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                id={`status-dropdown-${item.id}`}
                                variant="ghost"
                                size="icon"
                                title="Change moderation status"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-xs">
                                Moderation
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(item.id, "approved")
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenRejectModal(item)}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                Reject...
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(item.id, "pending")
                                }
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(item.id, "archived")
                                }
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setItemToDelete(item)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            id={`delete-resource-${item.id}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => setItemToDelete(item)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete resource"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        </QueryState>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 pt-2 border-t shrink-0">
            <span className="text-xs text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total items)
            </span>
            <div className="flex items-center gap-2">
              <Button
                id="resource-prev-page-btn"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                id="resource-next-page-btn"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!itemToDelete}
          onOpenChange={(open) => !open && setItemToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Resource</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  &quot;{itemToDelete?.title}&quot;
                </span>
                ? This action cannot be undone and will purge this resource from
                all roadmaps and user lists.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel id="cancel-delete-resource-btn">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                id="confirm-delete-resource-btn"
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Rejection Modal with Reason */}
        <Dialog
          open={!!itemToReject}
          onOpenChange={(open) => !open && setItemToReject(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Reject Resource Submission
              </DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting &quot;{itemToReject?.title}&quot;.
                This reason will be visible to the submitter so they can revise
                their submission.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason-input" className="text-xs">
                  Rejection Reason <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rejection-reason-input"
                  placeholder="e.g. Broken URL, Paywalled content, Duplicate resource"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-notes-input" className="text-xs">
                  Admin Internal Notes (Optional)
                </Label>
                <Textarea
                  id="admin-notes-input"
                  placeholder="Internal notes visible to moderators only..."
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setItemToReject(null)}
                id="cancel-reject-resource-btn"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                id="confirm-reject-resource-btn"
                disabled={isModerating}
              >
                {isModerating ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
