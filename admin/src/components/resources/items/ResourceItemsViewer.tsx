"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChevronLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  Archive,
  XCircle,
  Copy,
  Check,
  Video,
  FileText,
  BookOpen,
  User,
  ShieldCheck,
  Calendar,
  ThumbsUp,
  Eye as EyeIcon,
  Code,
  Layout,
  MessageSquareWarning,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QueryState } from "@/components/ui/query-state";
import {
  useAdminResourceDetail,
  useAdminResourceMutations,
} from "@/hooks/useRoadmapResource";

interface ResourceItemsViewerProps {
  id: string;
  slug?: string;
  onBack: () => void;
}

export function ResourceItemsViewer({ id, onBack }: ResourceItemsViewerProps) {
  const { resource, isLoading, isError, error } = useAdminResourceDetail(id);
  const { moderateResource, isModerating } = useAdminResourceMutations();

  const [viewMode, setViewMode] = useState<"ui" | "json">("ui");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const handleCopyJson = () => {
    if (!resource) return;
    navigator.clipboard.writeText(JSON.stringify(resource, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyUrl = () => {
    if (!resource?.url) return;
    navigator.clipboard.writeText(resource.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyUserId = (userId?: string | null) => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopiedUserId(true);
    setTimeout(() => setCopiedUserId(false), 2000);
  };

  const handleApprove = async () => {
    if (!resource) return;
    await moderateResource({
      id: resource.id,
      payload: { status: "approved" },
    });
  };

  const handleConfirmReject = async () => {
    if (!resource) return;
    await moderateResource({
      id: resource.id,
      payload: {
        status: "rejected",
        rejectionReason: rejectionReason.trim() || "Does not meet quality guidelines",
        adminNotes: adminNotes.trim() || undefined,
      },
    });
    setRejectModalOpen(false);
  };

  const submitter = resource?.submittedBy;
  const review = resource?.review;

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingMessage="Loading resource details..."
      errorTitle="Failed to load resource"
    >
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        {/* Top Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Button
              id="back-to-resources-btn"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to List
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {resource?.origin === "community" ? "Community" : "Official"}
              </Badge>

              {resource?.status === "approved" && (
                <Badge variant="default" className="gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Approved
                </Badge>
              )}
              {resource?.status === "pending" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              )}
              {resource?.status === "rejected" && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <XCircle className="h-3 w-3" />
                  Rejected
                </Badge>
              )}
              {resource?.status === "archived" && (
                <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
                  <Archive className="h-3 w-3" />
                  Archived
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
              <Button
                variant={viewMode === "ui" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => setViewMode("ui")}
              >
                <Layout className="h-3.5 w-3.5" />
                UI View
              </Button>
              <Button
                variant={viewMode === "json" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => setViewMode("json")}
              >
                <Code className="h-3.5 w-3.5" />
                JSON
              </Button>
            </div>

            {/* Quick Moderation Actions */}
            {resource?.status !== "approved" && (
              <Button
                id="viewer-approve-btn"
                size="sm"
                variant="default"
                className="gap-1.5"
                onClick={handleApprove}
                disabled={isModerating}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            )}

            {resource?.status !== "rejected" && (
              <Button
                id="viewer-reject-btn"
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={() => {
                  setRejectionReason(review?.rejectionReason || "");
                  setAdminNotes(review?.adminNotes || "");
                  setRejectModalOpen(true);
                }}
                disabled={isModerating}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            )}

            <Button
              id="copy-resource-json-btn"
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="gap-1 text-xs"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy JSON
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-auto pr-1">
          {viewMode === "json" ? (
            <Card className="border bg-zinc-950 font-mono text-xs">
              <CardContent className="p-4">
                <pre className="text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(resource, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Rejection Alert if rejected */}
                {resource?.status === "rejected" && review?.rejectionReason && (
                  <Card className="border-destructive/30 bg-destructive/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
                        <MessageSquareWarning className="h-4 w-4" />
                        Rejection Notice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <p className="font-medium text-foreground">
                        {review.rejectionReason}
                      </p>
                      {review.reviewedAt && (
                        <p className="text-muted-foreground text-[11px]">
                          Reviewed on {new Date(review.reviewedAt).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Resource Header Card */}
                <Card className="border bg-card">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs uppercase tracking-wide mb-1"
                        >
                          {resource?.type}
                        </Badge>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                          {resource?.title}
                        </CardTitle>
                        {resource?.author && (
                          <CardDescription className="text-sm font-medium text-muted-foreground">
                            Creator / Channel:{" "}
                            <span className="text-foreground font-semibold">
                              {resource.author}
                            </span>
                          </CardDescription>
                        )}
                      </div>

                      {resource?.thumbnailUrl && (
                        <img
                          src={resource.thumbnailUrl}
                          alt={resource.title}
                          className="w-32 h-20 rounded-md object-cover border bg-muted shrink-0"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* URL Link Box */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                      <div className="flex items-center gap-2 min-w-0">
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono truncate text-foreground">
                          {resource?.url}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={handleCopyUrl}
                        >
                          {copiedUrl ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedUrl ? "Copied" : "Copy"}
                        </Button>
                        <a
                          href={resource?.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-xs border rounded-lg px-2.5 h-7 hover:bg-muted font-medium text-foreground transition-colors"
                        >
                          Visit
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {resource?.description || (
                          <span className="text-muted-foreground italic">
                            No description provided.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Assigned Roadmaps */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Assigned Roadmaps
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {resource?.roadmapIds &&
                        resource.roadmapIds.length > 0 ? (
                          resource.roadmapIds.map((slug) => (
                            <Badge
                              key={slug}
                              variant="outline"
                              className="font-mono text-xs px-2.5 py-1"
                            >
                              {slug}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No roadmaps assigned.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Upvotes
                          </div>
                          <div className="text-sm font-bold font-mono text-foreground">
                            {resource?.stats?.upvotesCount ?? 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20">
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Views
                          </div>
                          <div className="text-sm font-bold font-mono text-foreground">
                            {resource?.stats?.viewsCount ?? 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Added On
                          </div>
                          <div className="text-xs font-medium text-foreground">
                            {resource?.createdAt
                              ? new Date(resource.createdAt).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Internal Notes (if any) */}
                {review?.adminNotes && (
                  <Card className="border bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Admin Internal Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-foreground whitespace-pre-wrap">
                        {review.adminNotes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Col: Submitter & Moderation Audit */}
              <div className="space-y-6">
                {/* Submitter Card */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Original Author & Submitter
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Author identity is permanently preserved and protected.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resource?.origin === "community" && submitter ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border">
                            {submitter.avatarUrl && (
                              <AvatarImage
                                src={submitter.avatarUrl}
                                alt={submitter.username || "User"}
                              />
                            )}
                            <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                              {submitter.username?.slice(0, 2).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground text-sm truncate">
                              {submitter.fullName || submitter.username || "Community User"}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              @{submitter.username || "anonymous"}
                            </div>
                          </div>
                        </div>

                        {submitter.userId && (
                          <div className="flex items-center justify-between p-2 rounded bg-muted/30 border text-xs font-mono">
                            <span className="text-muted-foreground truncate max-w-[170px]">
                              ID: {submitter.userId}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[10px]"
                              onClick={() => handleCopyUserId(submitter.userId)}
                            >
                              {copiedUserId ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}

                        {submitter.submittedAt && (
                          <div className="text-xs text-muted-foreground">
                            Submitted on:{" "}
                            <span className="text-foreground">
                              {new Date(submitter.submittedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <ShieldCheck className="h-8 w-8 text-muted-foreground shrink-0" />
                        <div>
                          <div className="font-semibold text-sm text-foreground">
                            Official Platform Entry
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Curated directly by Antigravity Admin team.
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Moderation History Card */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Moderation Audit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-muted-foreground">Current Status</span>
                      <span className="capitalize font-semibold text-foreground">
                        {resource?.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-muted-foreground">Reviewed By</span>
                      <span className="font-mono text-foreground">
                        {review?.reviewedBy || "Pending Review"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Reviewed At</span>
                      <span className="text-foreground">
                        {review?.reviewedAt
                          ? new Date(review.reviewedAt).toLocaleString()
                          : "Not yet reviewed"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Rejection Dialog */}
        <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Reject Resource
              </DialogTitle>
              <DialogDescription>
                Provide a specific reason for rejection to help the author understand.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="viewer-rejection-reason" className="text-xs">
                  Rejection Reason <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="viewer-rejection-reason"
                  placeholder="e.g. Broken link, inappropriate content, paywalled"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="viewer-admin-notes" className="text-xs">
                  Internal Notes (Optional)
                </Label>
                <Textarea
                  id="viewer-admin-notes"
                  placeholder="Internal notes visible to admins only..."
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectModalOpen(false)}
                id="cancel-viewer-reject-btn"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                id="confirm-viewer-reject-btn"
                disabled={isModerating}
              >
                {isModerating ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </QueryState>
  );
}
