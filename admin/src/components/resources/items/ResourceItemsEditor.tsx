"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  ChevronLeft,
  ShieldCheck,
  ExternalLink,
  X,
  Save,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import {
  useAdminResourceDetail,
  useAdminResourceMutations,
} from "@/hooks/useRoadmapResource";
import { useDeveloperRoadmaps } from "@/hooks/useResource";
import { toast } from "sonner";
import type {
  AdminResourceStatus,
  AdminResourceOrigin,
  CreateAdminResourcePayload,
  UpdateAdminResourcePayload,
} from "@/types/roadmap-resource";

interface ResourceItemsEditorProps {
  id?: string;
  slug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ResourceItemsEditor({
  id,
  onSuccess,
  onCancel,
}: ResourceItemsEditorProps) {
  const isEditing = Boolean(id);
  const { resource, isLoading: isLoadingResource } = useAdminResourceDetail(id);
  const { roadmaps } = useDeveloperRoadmaps();
  const { createResource, updateResource, isCreating, isUpdating } =
    useAdminResourceMutations();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [type, setType] = useState("Video");
  const [author, setAuthor] = useState("");
  const [origin, setOrigin] = useState<AdminResourceOrigin>("official");
  const [status, setStatus] = useState<AdminResourceStatus>("approved");
  const [roadmapIds, setRoadmapIds] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedRoadmapToAdd, setSelectedRoadmapToAdd] = useState("");

  // Populate form in edit mode
  useEffect(() => {
    if (resource && isEditing) {
      setTitle(resource.title || "");
      setDescription(resource.description || "");
      setUrl(resource.url || "");
      setThumbnailUrl(resource.thumbnailUrl || "");
      setType(resource.type || "Video");
      setAuthor(resource.author || "");
      setOrigin(resource.origin || "official");
      setStatus(resource.status || "approved");
      setRoadmapIds(resource.roadmapIds || []);
      setRejectionReason(resource.review?.rejectionReason || "");
      setAdminNotes(resource.review?.adminNotes || "");
    }
  }, [resource, isEditing]);

  const handleAddRoadmap = (slug: string) => {
    if (!slug) return;
    if (!roadmapIds.includes(slug)) {
      setRoadmapIds([...roadmapIds, slug]);
    }
    setSelectedRoadmapToAdd("");
  };

  const handleRemoveRoadmap = (slugToRemove: string) => {
    setRoadmapIds(roadmapIds.filter((id) => id !== slugToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Resource title is required");
      return;
    }

    if (!url.trim()) {
      toast.error("Resource URL is required");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    if (roadmapIds.length === 0) {
      toast.error("Please assign at least one roadmap to this resource");
      return;
    }

    if (isEditing && id) {
      const payload: UpdateAdminResourcePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
        type: type.trim(),
        author: author.trim() || undefined,
        roadmapIds,
        origin,
        status,
        rejectionReason:
          status === "rejected" ? rejectionReason.trim() : null,
        adminNotes: adminNotes.trim() || null,
      };

      await updateResource({ id, payload });
      onSuccess();
    } else {
      const payload: CreateAdminResourcePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
        type: type.trim(),
        author: author.trim() || undefined,
        roadmapIds,
        origin,
        status,
        adminNotes: adminNotes.trim() || undefined,
      };

      await createResource(payload);
      onSuccess();
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button
            id="editor-back-btn"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Cancel
          </Button>

          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {isEditing ? "Edit Learning Resource" : "Create Learning Resource"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? "Update resource properties and moderation status. Original author is preserved."
                : "Add an official or curated learning resource to developer roadmaps."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="cancel-resource-btn"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            id="save-resource-btn"
            size="sm"
            onClick={handleSubmit}
            disabled={isSaving || (isEditing && isLoadingResource)}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            {isSaving
              ? "Saving..."
              : isEditing
              ? "Update Resource"
              : "Create Resource"}
          </Button>
        </div>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 min-h-0 overflow-auto pr-1">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-10">
          {/* Author Preservation Alert in Edit Mode */}
          {isEditing && (
            <Alert className="border bg-muted/30">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">
                Original Author Protected
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground mt-1">
                {resource?.submittedBy?.username ? (
                  <>
                    This resource was submitted by community member{" "}
                    <span className="font-semibold text-foreground">
                      @{resource.submittedBy.username}
                    </span>
                    . Your changes will update the content, roadmaps, and status,
                    while leaving the author&apos;s identity intact.
                  </>
                ) : (
                  <>
                    Original submitter authorship and timestamps are preserved
                    and will never be altered by admin updates.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Core Info Card */}
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Resource Details
              </CardTitle>
              <CardDescription className="text-xs">
                Title, destination URL, content type, and channel information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="resource-title-input" className="text-xs">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="resource-title-input"
                  placeholder="e.g. Next.js 15 Complete Course - Beginner to Advanced"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* URL */}
              <div className="space-y-1.5">
                <Label htmlFor="resource-url-input" className="text-xs">
                  Resource URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="resource-url-input"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      title="Open URL in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Type & Author Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="resource-type-select" className="text-xs">
                    Content Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="resource-type-select">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YouTube Playlist">
                        YouTube Playlist
                      </SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Course">Full Course</SelectItem>
                      <SelectItem value="Article">Article / Guide</SelectItem>
                      <SelectItem value="Documentation">
                        Official Documentation
                      </SelectItem>
                      <SelectItem value="Book">Interactive Book</SelectItem>
                      <SelectItem value="Podcast">Podcast / Talk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="resource-author-input" className="text-xs">
                    Creator / Channel / Platform
                  </Label>
                  <Input
                    id="resource-author-input"
                    placeholder="e.g. freeCodeCamp, Fireship, Academind"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
              </div>

              {/* Thumbnail URL & Preview */}
              <div className="space-y-1.5">
                <Label htmlFor="resource-thumbnail-input" className="text-xs">
                  Thumbnail Image URL (Optional)
                </Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="resource-thumbnail-input"
                    type="url"
                    placeholder="https://images.unsplash.com/... or https://i.ytimg.com/..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="flex-1"
                  />
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Preview"
                      className="w-16 h-10 rounded border object-cover shrink-0 bg-muted"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-10 rounded border shrink-0 bg-muted/40 flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="resource-desc-input" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="resource-desc-input"
                  placeholder="Summary of what developers will learn from this resource..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Roadmaps Assignment Card */}
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Assigned Developer Roadmaps
              </CardTitle>
              <CardDescription className="text-xs">
                Select which roadmaps will feature this resource in their learning
                recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select
                  value={selectedRoadmapToAdd}
                  onValueChange={(val) => {
                    handleAddRoadmap(val);
                  }}
                >
                  <SelectTrigger id="add-roadmap-select" className="flex-1">
                    <SelectValue placeholder="Add a roadmap..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roadmaps
                      ?.filter((r) => !roadmapIds.includes(r.slug))
                      ?.map((rm) => (
                        <SelectItem key={rm.slug} value={rm.slug}>
                          {rm.title?.card || rm.slug} ({rm.slug})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pills of assigned roadmaps */}
              <div className="flex flex-wrap gap-2 pt-1">
                {roadmapIds.map((slug) => (
                  <Badge
                    key={slug}
                    variant="outline"
                    className="text-xs px-2.5 py-1 gap-1.5 font-mono"
                  >
                    {slug}
                    <button
                      type="button"
                      id={`remove-roadmap-${slug}-btn`}
                      onClick={() => handleRemoveRoadmap(slug)}
                      className="text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {roadmapIds.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    No roadmaps assigned yet. Please select at least one roadmap above.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Moderation & Metadata Card */}
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Moderation & Publishing Status
              </CardTitle>
              <CardDescription className="text-xs">
                Control visibility, origin attribution, and admin review notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-1.5">
                  <Label htmlFor="resource-status-select" className="text-xs">
                    Moderation Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(val) =>
                      setStatus(val as AdminResourceStatus)
                    }
                  >
                    <SelectTrigger id="resource-status-select">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Origin */}
                <div className="space-y-1.5">
                  <Label htmlFor="resource-origin-select" className="text-xs">
                    Origin Attribution
                  </Label>
                  <Select
                    value={origin}
                    onValueChange={(val) =>
                      setOrigin(val as AdminResourceOrigin)
                    }
                  >
                    <SelectTrigger id="resource-origin-select">
                      <SelectValue placeholder="Origin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">Official Staff</SelectItem>
                      <SelectItem value="community">Community Submitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rejection Reason (shown if status is rejected) */}
              {status === "rejected" && (
                <div className="space-y-1.5 pt-2 border-t">
                  <Label
                    htmlFor="resource-rejection-reason"
                    className="text-xs text-destructive font-semibold flex items-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    Rejection Reason
                  </Label>
                  <Input
                    id="resource-rejection-reason"
                    placeholder="Provide reason why this was rejected (visible to author)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              {/* Admin Internal Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="resource-admin-notes" className="text-xs">
                  Admin Internal Notes (Optional)
                </Label>
                <Textarea
                  id="resource-admin-notes"
                  placeholder="Private notes for the moderation team..."
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
