"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  GitBranch,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Archive,
  MoreVertical,
  Filter,
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
  useDeveloperRoadmaps,
  useRoadmapCategories,
  useResourceAdminStats,
} from "@/hooks/useResource";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { Roadmap } from "@/types/resource";

interface RoadmapListProps {
  onEdit: (slug: string) => void;
  onView: (slug: string) => void;
  activeId?: string | null;
}

export function RoadmapList({ onEdit, onView }: RoadmapListProps) {
  const {
    roadmaps,
    isLoading,
    isError,
    error,
    deleteRoadmap,
    isDeleting,
    updateRoadmapStatus,
    isUpdatingStatus,
  } = useDeveloperRoadmaps();
  const { categories } = useRoadmapCategories();
  const { stats } = useResourceAdminStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [itemToDelete, setItemToDelete] = useState<Roadmap | null>(null);

  // Map each roadmap slug to the categories whose sections contain it
  // This mirrors the public web frontend without requiring any DB changes
  const slugToCategoriesMap = useMemo(() => {
    const map = new Map<string, { id: string; title: string }[]>();
    categories?.forEach((cat) => {
      cat.sections?.forEach((section) => {
        section.roadmaps?.forEach((rm) => {
          const list = map.get(rm.slug) || [];
          if (!list.some((item) => item.id === cat.categoryId)) {
            list.push({ id: cat.categoryId, title: cat.title });
          }
          map.set(rm.slug, list);
        });
      });
    });
    return map;
  }, [categories]);

  const getRoadmapCategories = (rm: Roadmap) => {
    const derived = slugToCategoriesMap.get(rm.slug) || [];
    if (derived.length > 0) return derived;
    if (rm.categories && rm.categories.length > 0) {
      return rm.categories.map((c) => ({ id: c, title: c }));
    }
    return [];
  };

  const filteredRoadmaps =
    roadmaps?.filter((rm) => {
      // Search text
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        rm.slug.toLowerCase().includes(q) ||
        rm.title?.card?.toLowerCase().includes(q) ||
        rm.title?.page?.toLowerCase().includes(q) ||
        rm.description?.toLowerCase().includes(q);

      // Category filter (checks both derived and direct categories)
      const roadmapCats = getRoadmapCategories(rm);
      const matchCategory =
        selectedCategory === "all" ||
        roadmapCats.some((c) => c.id === selectedCategory);

      // Status filter
      const matchStatus =
        selectedStatus === "all" || rm.status === selectedStatus;

      // Type filter
      const matchType = selectedType === "all" || rm.type === selectedType;

      return matchSearch && matchCategory && matchStatus && matchType;
    }) || [];

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteRoadmap(itemToDelete.slug);
      setItemToDelete(null);
    }
  };

  const handleStatusChange = async (
    slug: string,
    status: "published" | "draft" | "archived"
  ) => {
    await updateRoadmapStatus({ slug, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge
            variant="default"
            className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1 font-normal text-xs"
          >
            <CheckCircle2 className="h-3 w-3" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/15 text-amber-400 border border-amber-500/30 gap-1 font-normal text-xs"
          >
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground border-border gap-1 font-normal text-xs"
          >
            <Archive className="h-3 w-3" />
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingMessage="Loading developer roadmaps..."
      errorTitle="Failed to load roadmaps"
    >
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        {/* Quick Stats Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border">
            <span className="text-xs text-muted-foreground">Total Roadmaps</span>
            <span className="font-bold text-sm text-foreground">
              {stats?.roadmaps?.total ?? roadmaps?.length ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-xs text-emerald-400">Published</span>
            <span className="font-bold text-sm text-emerald-400">
              {stats?.roadmaps?.published ??
                roadmaps?.filter((r) => r.status === "published").length ??
                0}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <span className="text-xs text-amber-400">Drafts</span>
            <span className="font-bold text-sm text-amber-400">
              {stats?.roadmaps?.draft ??
                roadmaps?.filter((r) => r.status === "draft").length ??
                0}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border">
            <span className="text-xs text-muted-foreground">Total Nodes</span>
            <span className="font-bold text-sm text-foreground font-mono">
              {stats?.totalNodes ?? 0}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="roadmap-search-input"
              type="search"
              placeholder="Search by title, slug, or keywords..."
              className="pl-8 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger
              id="roadmap-category-filter"
              className="w-[170px] bg-transparent text-xs"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories
                ?.filter((cat) => cat.categoryId !== "all")
                ?.map((cat) => (
                  <SelectItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger
              id="roadmap-status-filter"
              className="w-[130px] bg-transparent text-xs"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger
              id="roadmap-type-filter"
              className="w-[120px] bg-transparent text-xs"
            >
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="role">Role</SelectItem>
              <SelectItem value="skill">Skill</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="font-mono text-xs ml-auto">
            {filteredRoadmaps.length} {filteredRoadmaps.length === 1 ? "roadmap" : "roadmaps"}
          </Badge>
        </div>

        {/* Data Table */}
        {!filteredRoadmaps || filteredRoadmaps.length === 0 ? (
          <EmptyState
            message={
              searchQuery ||
              selectedCategory !== "all" ||
              selectedStatus !== "all" ||
              selectedType !== "all"
                ? "No roadmaps match the selected filters."
                : "No roadmaps found. Click 'Create New' to build one."
            }
          />
        ) : (
          <div className="rounded-md border flex-1 min-h-0 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                <TableRow>
                  <TableHead>Roadmap</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead className="text-center">Nodes</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoadmaps.map((roadmap) => {
                  const roadmapCats = getRoadmapCategories(roadmap);

                  return (
                    <TableRow
                      key={roadmap.id || roadmap.slug}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      {/* Title */}
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">
                            {roadmap.title?.card || roadmap.slug}
                          </div>
                          {roadmap.title?.page && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {roadmap.title.page}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Slug */}
                      <TableCell>
                        <span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded border">
                          {roadmap.slug}
                        </span>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="text-xs uppercase tracking-wide font-mono"
                        >
                          {roadmap.type || "role"}
                        </Badge>
                      </TableCell>

                      {/* Categories (Derived from Category sections) */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {roadmapCats.length > 0 ? (
                            roadmapCats.map((cat) => (
                              <span
                                key={cat.id}
                                className="text-[11px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20"
                                title={cat.title}
                              >
                                {cat.id}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Nodes Count */}
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs gap-1">
                          <GitBranch className="h-3 w-3 text-muted-foreground" />
                          {roadmap.nodesCount ?? roadmap.nodes?.length ?? 0}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        {getStatusBadge(roadmap.status)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            id={`view-roadmap-${roadmap.slug}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(roadmap.slug)}
                            title="View roadmap details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            id={`edit-roadmap-${roadmap.slug}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(roadmap.slug)}
                            title="Edit roadmap"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Quick Status Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                id={`status-dropdown-${roadmap.slug}`}
                                variant="ghost"
                                size="icon"
                                title="Change status"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-xs">
                                Update Status
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(roadmap.slug, "published")
                                }
                                disabled={roadmap.status === "published"}
                                className="gap-2 text-xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                Publish
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(roadmap.slug, "draft")
                                }
                                disabled={roadmap.status === "draft"}
                                className="gap-2 text-xs"
                              >
                                <Clock className="h-3.5 w-3.5 text-amber-400" />
                                Set as Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(roadmap.slug, "archived")
                                }
                                disabled={roadmap.status === "archived"}
                                className="gap-2 text-xs"
                              >
                                <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            id={`delete-roadmap-${roadmap.slug}`}
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setItemToDelete(roadmap)}
                            disabled={isDeleting}
                            title="Delete roadmap"
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
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Developer Roadmap?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-1 text-left">
              <div>
                This action cannot be undone. This will permanently remove the
                roadmap{" "}
                <span className="font-semibold text-foreground">
                  "{itemToDelete?.title?.card || itemToDelete?.slug}"
                </span>{" "}
                (
                <span className="font-mono text-xs text-muted-foreground">
                  {itemToDelete?.slug}
                </span>
                ) and its flow graphs from the system.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="cancel-delete-roadmap-btn">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-roadmap-btn"
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Roadmap"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryState>
  );
}
