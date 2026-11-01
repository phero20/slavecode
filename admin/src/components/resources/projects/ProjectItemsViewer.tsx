"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  Archive,
  XCircle,
  Copy,
  Check,
  User,
  ShieldCheck,
  Calendar,
  Eye as EyeIcon,
  Code,
  Layout,
  MessageSquareWarning,
  TrendingUp,
  Award,
  ThumbsUp,
  CheckSquare,
  ListOrdered,
  Sparkles,
  Layers,
  Wrench,
  Tag,
  RefreshCw,
} from "lucide-react";
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
import { QueryState } from "@/components/ui/query-state";
import {
  useAdminProjectDetail,
  useAdminProjectMutations,
} from "@/hooks/useRoadmapProject";

interface ProjectItemsViewerProps {
  id: string;
  slug?: string;
  onBack: () => void;
}

export function ProjectItemsViewer({ id, onBack }: ProjectItemsViewerProps) {
  const { project, isLoading, isError, error } = useAdminProjectDetail(id);
  const { moderateProject, isModerating } = useAdminProjectMutations();

  const [viewMode, setViewMode] = useState<"ui" | "json">("ui");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const handleCopyJson = () => {
    if (!project) return;
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopySlug = () => {
    if (!project?.slug) return;
    navigator.clipboard.writeText(project.slug);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const handleCopyUserId = (userId?: string | null) => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopiedUserId(true);
    setTimeout(() => setCopiedUserId(false), 2000);
  };

  const handleApprove = async () => {
    if (!project) return;
    await moderateProject({
      slugOrId: project.id,
      payload: { status: "approved" },
    });
  };

  const handleConfirmReject = async () => {
    if (!project) return;
    await moderateProject({
      slugOrId: project.id,
      payload: {
        status: "rejected",
        rejectionReason:
          rejectionReason.trim() || "Does not meet project guidelines",
        adminNotes: adminNotes.trim() || undefined,
      },
    });
    setRejectModalOpen(false);
  };

  const submitter = project?.submittedBy;
  const review = project?.review;
  const content = project?.content;

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingMessage="Loading project details..."
      errorTitle="Failed to load project"
    >
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        {/* Top Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Button
              id="back-to-projects-btn"
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
                {project?.origin === "community" ? "Community" : "Official"}
              </Badge>

              {project?.status === "approved" && (
                <Badge variant="default" className="gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Approved
                </Badge>
              )}
              {project?.status === "pending" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  Pending Review
                </Badge>
              )}
              {project?.status === "rejected" && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <XCircle className="h-3 w-3" />
                  Rejected
                </Badge>
              )}
              {project?.status === "archived" && (
                <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
                  <Archive className="h-3 w-3" />
                  Archived
                </Badge>
              )}
              {project?.status === "updated" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <RefreshCw className="h-3 w-3" />
                  Updated
                </Badge>
              )}

              {project?.difficulty && (
                <Badge variant="outline" className="text-xs font-mono capitalize">
                  {project.difficulty}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/40 p-0.5 rounded-lg border">
              <Button
                id="toggle-ui-view-btn"
                variant={viewMode === "ui" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs gap-1"
                onClick={() => setViewMode("ui")}
              >
                <Layout className="h-3.5 w-3.5" />
                UI View
              </Button>
              <Button
                id="toggle-json-view-btn"
                variant={viewMode === "json" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs gap-1"
                onClick={() => setViewMode("json")}
              >
                <Code className="h-3.5 w-3.5" />
                Raw JSON
              </Button>
            </div>

            {/* Copy JSON */}
            <Button
              id="copy-project-json-btn"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleCopyJson}
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy JSON
                </>
              )}
            </Button>

            {/* Quick Moderation Actions */}
            {project?.status !== "approved" && (
              <Button
                id="viewer-approve-btn"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleApprove}
                disabled={isModerating}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve Project
              </Button>
            )}

            {project?.status !== "rejected" && (
              <Button
                id="viewer-reject-btn"
                variant="destructive"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => {
                  setRejectionReason(review?.rejectionReason || "");
                  setAdminNotes(review?.adminNotes || "");
                  setRejectModalOpen(true);
                }}
                disabled={isModerating}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject...
              </Button>
            )}
          </div>
        </div>

        {/* View Mode: RAW JSON */}
        {viewMode === "json" ? (
          <div className="flex-1 min-h-0 border rounded-lg bg-muted/20 p-4 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground select-all">
              {JSON.stringify(project, null, 2)}
            </pre>
          </div>
        ) : (
          /* View Mode: INTERACTIVE UI */
          <div className="flex-1 min-h-0 overflow-auto pr-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-10">
              {/* Left Column (2 Cols): Project Details & Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Rejection Alert if rejected */}
                {project?.status === "rejected" && (
                  <Card className="border-destructive/30 bg-destructive/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 text-destructive">
                        <MessageSquareWarning className="h-4 w-4" />
                        <CardTitle className="text-sm font-semibold">
                          Rejection Notice
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs">
                      <div className="font-medium text-foreground">
                        Reason:{" "}
                        <span className="font-normal text-muted-foreground">
                          {review?.rejectionReason ||
                            "No specific reason provided."}
                        </span>
                      </div>
                      {review?.adminNotes && (
                        <div className="text-muted-foreground pt-1 border-t border-destructive/20 mt-2">
                          <span className="font-medium text-foreground">
                            Internal Admin Notes:{" "}
                          </span>
                          {review.adminNotes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Core Project Card */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold tracking-tight">
                          {project?.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <div className="flex items-center gap-1 bg-muted/50 border rounded px-2 py-0.5 text-xs font-mono">
                            <span>/{project?.slug}</span>
                            <button
                              id="copy-slug-btn"
                              onClick={handleCopySlug}
                              className="text-muted-foreground hover:text-foreground ml-1"
                              title="Copy slug"
                            >
                              {copiedSlug ? (
                                <Check className="h-3 w-3 text-primary" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          {project?.type && (
                            <Badge variant="secondary" className="text-xs">
                              {project.type}
                            </Badge>
                          )}
                          {project?.difficulty && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {project.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Description
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {project?.description || "No description provided."}
                      </p>
                    </div>

                    {/* Preview Image if present */}
                    {content?.previewImage && (
                      <div className="pt-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Preview Image
                        </h4>
                        <div className="border rounded-lg overflow-hidden max-h-64 bg-muted/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={content.previewImage}
                            alt={project?.title || "Project preview"}
                            className="w-full h-auto max-h-64 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Content Overview & Instructions */}
                {(content?.overview || content?.markdown) && (
                  <Card className="border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Project Overview & Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm leading-relaxed">
                      {content.overview && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                            Overview
                          </h4>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {content.overview}
                          </p>
                        </div>
                      )}
                      {content.markdown && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                            Instructions & Guide
                          </h4>
                          <div className="p-3 bg-muted/20 border rounded-lg font-mono text-xs whitespace-pre-wrap">
                            {content.markdown}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Requirements & Checklist */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      Requirements & Checklist
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Functional requirements and completion criteria for learners.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Requirements */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ListOrdered className="h-3.5 w-3.5" />
                        Core Requirements (
                        {content?.requirements?.length || 0})
                      </h4>
                      {content?.requirements && content.requirements.length > 0 ? (
                        <ul className="space-y-2">
                          {content.requirements.map((req, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs p-2 rounded-md bg-muted/20 border"
                            >
                              <span className="font-mono text-muted-foreground font-semibold">
                                {idx + 1}.
                              </span>
                              <span className="text-foreground">{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No specific requirements listed.
                        </p>
                      )}
                    </div>

                    {/* Checklist */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5" />
                        Step-by-step Checklist (
                        {content?.checklist?.length || 0})
                      </h4>
                      {content?.checklist && content.checklist.length > 0 ? (
                        <ul className="space-y-1.5">
                          {content.checklist.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/20 border"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No checklist items defined.
                        </p>
                      )}
                    </div>

                    {/* Bonus Challenges */}
                    {content?.bonusChallenges &&
                      content.bonusChallenges.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            Bonus Challenges ({content.bonusChallenges.length})
                          </h4>
                          <ul className="space-y-1.5">
                            {content.bonusChallenges.map((challenge, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs p-2 rounded-md bg-muted/20 border"
                              >
                                <span className="font-mono text-primary font-semibold">
                                  +
                                </span>
                                <span className="text-foreground">
                                  {challenge}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Tech Stack, Topics & Skills */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      Tech Stack, Topics & Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Suggested Tech Stack */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Suggested Tech Stack
                      </h4>
                      {content?.suggestedTechStack &&
                      content.suggestedTechStack.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {content.suggestedTechStack.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No tech stack specified.
                        </p>
                      )}
                    </div>

                    {/* Topics */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Topics
                      </h4>
                      {project?.topics && project.topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {project.topics.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No topics tagged.
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Skills
                      </h4>
                      {project?.skills && project.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {project.skills.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs font-mono">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No skills listed.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column (1 Col): Submitter, Roadmaps & Audit */}
              <div className="space-y-6">
                {/* Submitter Attribution Card */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Author & Attribution
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Origin and submitter identity metadata.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/20 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={submitter?.avatarUrl || undefined}
                          alt={submitter?.username || "Submitter"}
                        />
                        <AvatarFallback className="text-xs">
                          {(submitter?.username?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">
                          {submitter?.fullName ||
                            submitter?.username ||
                            (project?.origin === "official"
                              ? "Official Editorial Team"
                              : "Community Member")}
                        </span>
                        {submitter?.username && (
                          <span className="text-xs text-muted-foreground truncate">
                            @{submitter.username}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className="w-fit text-[10px] mt-1 font-mono"
                        >
                          {project?.origin === "community"
                            ? "Community Contribution"
                            : "Official Project"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {submitter?.userId && (
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="text-muted-foreground">User ID</span>
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span className="truncate max-w-[140px]">
                              {submitter.userId}
                            </span>
                            <button
                              id="copy-userid-btn"
                              onClick={() => handleCopyUserId(submitter.userId)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Copy User ID"
                            >
                              {copiedUserId ? (
                                <Check className="h-3 w-3 text-primary" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-muted-foreground">Submitted At</span>
                        <span className="font-mono text-foreground">
                          {submitter?.submittedAt
                            ? new Date(submitter.submittedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created Date</span>
                        <span className="font-mono text-foreground">
                          {project?.createdAt
                            ? new Date(project.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Moderation Audit Card */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Moderation Audit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-muted-foreground">Current Status</span>
                      <div>
                        {project?.status === "approved" && (
                          <Badge variant="default" className="text-xs">
                            Approved
                          </Badge>
                        )}
                        {project?.status === "pending" && (
                          <Badge variant="secondary" className="text-xs">
                            Pending
                          </Badge>
                        )}
                        {project?.status === "rejected" && (
                          <Badge variant="destructive" className="text-xs">
                            Rejected
                          </Badge>
                        )}
                        {project?.status === "archived" && (
                          <Badge variant="outline" className="text-xs">
                            Archived
                          </Badge>
                        )}
                        {project?.status === "updated" && (
                          <Badge variant="secondary" className="text-xs">
                            Updated
                          </Badge>
                        )}
                      </div>
                    </div>

                    {review?.reviewedBy && (
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-muted-foreground">Reviewed By</span>
                        <span className="font-mono text-foreground truncate max-w-[150px]">
                          {review.reviewedBy}
                        </span>
                      </div>
                    )}

                    {review?.reviewedAt && (
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-muted-foreground">Reviewed At</span>
                        <span className="font-mono text-foreground">
                          {new Date(review.reviewedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {review?.rejectionReason && (
                      <div className="space-y-1 pt-1">
                        <span className="text-muted-foreground font-medium">
                          Rejection Reason:
                        </span>
                        <p className="p-2 bg-destructive/10 text-destructive rounded border border-destructive/20 text-xs">
                          {review.rejectionReason}
                        </p>
                      </div>
                    )}

                    {review?.adminNotes && (
                      <div className="space-y-1 pt-1">
                        <span className="text-muted-foreground font-medium">
                          Internal Admin Notes:
                        </span>
                        <p className="p-2 bg-muted/40 rounded border text-xs text-foreground">
                          {review.adminNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Engagement Stats Card */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Learner Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 bg-muted/20 border rounded-lg">
                        <div className="text-lg font-bold font-mono text-foreground">
                          {project?.stats?.startedCount ?? 0}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Started
                        </div>
                      </div>
                      <div className="p-2.5 bg-muted/20 border rounded-lg">
                        <div className="text-lg font-bold font-mono text-foreground">
                          {project?.stats?.completedCount ?? 0}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Completed
                        </div>
                      </div>
                      <div className="p-2.5 bg-muted/20 border rounded-lg">
                        <div className="text-lg font-bold font-mono text-foreground">
                          {project?.stats?.upvotesCount ?? 0}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Upvotes
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assigned Roadmaps Card */}
                <Card className="border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      Assigned Roadmaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project?.roadmapIds && project.roadmapIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {project.roadmapIds.map((rm) => (
                          <Badge
                            key={rm}
                            variant="secondary"
                            className="font-mono text-xs px-2 py-0.5"
                          >
                            {rm}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Not linked to any roadmaps yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        <Dialog
          open={rejectModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setRejectModalOpen(false);
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
                will be shared with the submitter.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="viewer-reject-reason-input" className="text-xs">
                  Rejection Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="viewer-reject-reason-input"
                  placeholder="Explain why this project does not meet guidelines..."
                  className="h-24 resize-none text-xs"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="viewer-reject-notes-input" className="text-xs">
                  Internal Admin Notes (Optional)
                </Label>
                <Textarea
                  id="viewer-reject-notes-input"
                  placeholder="Notes for staff review only..."
                  className="h-16 resize-none text-xs"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                id="viewer-cancel-reject-btn"
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={isModerating}
              >
                Cancel
              </Button>
              <Button
                id="viewer-confirm-reject-btn"
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
      </div>
    </QueryState>
  );
}

