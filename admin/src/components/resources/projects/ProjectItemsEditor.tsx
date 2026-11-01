"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  ListOrdered,
  CheckSquare,
  Wrench,
  Tag,
  Award,
} from "lucide-react";
import {
  useAdminProjectDetail,
  useAdminProjectMutations,
} from "@/hooks/useRoadmapProject";
import { useDeveloperRoadmaps } from "@/hooks/useResource";
import { toast } from "sonner";
import type {
  AdminProjectStatus,
  AdminProjectOrigin,
  AdminProjectDifficulty,
  CreateAdminProjectPayload,
  UpdateAdminProjectPayload,
} from "@/types/roadmap-project";

interface ProjectItemsEditorProps {
  id?: string;
  slug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectItemsEditor({
  id,
  onSuccess,
  onCancel,
}: ProjectItemsEditorProps) {
  const isEditing = Boolean(id);
  const { project, isLoading: isLoadingProject } = useAdminProjectDetail(id);
  const { roadmaps } = useDeveloperRoadmaps();
  const { createProject, updateProject, isCreating, isUpdating } =
    useAdminProjectMutations();

  // Basic info state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] =
    useState<AdminProjectDifficulty>("intermediate");
  const [type, setType] = useState("Full Stack");

  // Roadmaps & Classification
  const [roadmapIds, setRoadmapIds] = useState<string[]>([]);
  const [selectedRoadmapToAdd, setSelectedRoadmapToAdd] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Content state
  const [overview, setOverview] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [suggestedTechStack, setSuggestedTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");

  // Array item builders
  const [requirements, setRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState("");

  const [checklist, setChecklist] = useState<string[]>([]);
  const [checklistInput, setChecklistInput] = useState("");

  const [bonusChallenges, setBonusChallenges] = useState<string[]>([]);
  const [bonusInput, setBonusInput] = useState("");

  // Moderation state
  const [origin, setOrigin] = useState<AdminProjectOrigin>("official");
  const [status, setStatus] = useState<AdminProjectStatus>("approved");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Populate form in edit mode
  useEffect(() => {
    if (project && isEditing) {
      setTitle(project.title || "");
      setSlug(project.slug || "");
      setDescription(project.description || "");
      setDifficulty(project.difficulty || "intermediate");
      setType(project.type || "Full Stack");
      setRoadmapIds(project.roadmapIds || []);
      setTopics(project.topics || []);
      setSkills(project.skills || []);

      setOverview(project.content?.overview || "");
      setMarkdown(project.content?.markdown || "");
      setPreviewImage(project.content?.previewImage || "");
      setSuggestedTechStack(project.content?.suggestedTechStack || []);
      setRequirements(project.content?.requirements || []);
      setChecklist(project.content?.checklist || []);
      setBonusChallenges(project.content?.bonusChallenges || []);

      setOrigin(project.origin || "official");
      setStatus(project.status || "approved");
      setRejectionReason(project.review?.rejectionReason || "");
      setAdminNotes(project.review?.adminNotes || "");
    }
  }, [project, isEditing]);

  // Roadmaps handler
  const handleAddRoadmap = (rmSlug: string) => {
    if (!rmSlug) return;
    if (!roadmapIds.includes(rmSlug)) {
      setRoadmapIds([...roadmapIds, rmSlug]);
    }
    setSelectedRoadmapToAdd("");
  };

  const handleRemoveRoadmap = (rmToRemove: string) => {
    setRoadmapIds(roadmapIds.filter((r) => r !== rmToRemove));
  };

  // Topics handler
  const handleAddTopic = () => {
    const val = topicInput.trim();
    if (!val) return;
    if (!topics.includes(val)) {
      setTopics([...topics, val]);
    }
    setTopicInput("");
  };

  const handleRemoveTopic = (tToRemove: string) => {
    setTopics(topics.filter((t) => t !== tToRemove));
  };

  // Skills handler
  const handleAddSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    if (!skills.includes(val)) {
      setSkills([...skills, val]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (sToRemove: string) => {
    setSkills(skills.filter((s) => s !== sToRemove));
  };

  // Tech stack handler
  const handleAddTech = () => {
    const val = techInput.trim();
    if (!val) return;
    if (!suggestedTechStack.includes(val)) {
      setSuggestedTechStack([...suggestedTechStack, val]);
    }
    setTechInput("");
  };

  const handleRemoveTech = (itemToRemove: string) => {
    setSuggestedTechStack(suggestedTechStack.filter((t) => t !== itemToRemove));
  };

  // Requirements handler
  const handleAddRequirement = () => {
    const val = requirementInput.trim();
    if (!val) return;
    setRequirements([...requirements, val]);
    setRequirementInput("");
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  // Checklist handler
  const handleAddChecklist = () => {
    const val = checklistInput.trim();
    if (!val) return;
    setChecklist([...checklist, val]);
    setChecklistInput("");
  };

  const handleRemoveChecklist = (idx: number) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  // Bonus Challenges handler
  const handleAddBonus = () => {
    const val = bonusInput.trim();
    if (!val) return;
    setBonusChallenges([...bonusChallenges, val]);
    setBonusInput("");
  };

  const handleRemoveBonus = (idx: number) => {
    setBonusChallenges(bonusChallenges.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Project description is required");
      return;
    }

    if (roadmapIds.length === 0) {
      toast.error("Please assign at least one roadmap to this project");
      return;
    }

    if (status === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason when setting status to rejected");
      return;
    }

    const contentPayload = {
      overview: overview.trim() || undefined,
      markdown: markdown.trim() || undefined,
      previewImage: previewImage.trim() || null,
      requirements: requirements.length > 0 ? requirements : undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
      bonusChallenges: bonusChallenges.length > 0 ? bonusChallenges : undefined,
      suggestedTechStack:
        suggestedTechStack.length > 0 ? suggestedTechStack : undefined,
    };

    if (isEditing && id) {
      const payload: UpdateAdminProjectPayload = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        type: type.trim() || undefined,
        roadmapIds,
        topics: topics.length > 0 ? topics : undefined,
        skills: skills.length > 0 ? skills : undefined,
        content: contentPayload,
        origin,
        status,
        rejectionReason:
          status === "rejected" ? rejectionReason.trim() : null,
        adminNotes: adminNotes.trim() || null,
      };

      await updateProject({ slugOrId: id, payload });
      onSuccess();
    } else {
      const payload: CreateAdminProjectPayload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        difficulty,
        type: type.trim() || "Full Stack",
        roadmapIds,
        topics: topics.length > 0 ? topics : undefined,
        skills: skills.length > 0 ? skills : undefined,
        content: contentPayload,
        origin,
        status,
        adminNotes: adminNotes.trim() || undefined,
      };

      await createProject(payload);
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
              {isEditing ? "Edit Roadmap Project" : "Create Roadmap Project"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? "Update project details, guides, and moderation status. Original author is strictly preserved."
                : "Add an official project or challenge to developer roadmaps."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="cancel-project-header-btn"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            id="save-project-header-btn"
            size="sm"
            onClick={handleSubmit}
            disabled={isSaving || (isEditing && isLoadingProject)}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            {isSaving
              ? "Saving..."
              : isEditing
              ? "Update Project"
              : "Create Project"}
          </Button>
        </div>
      </div>

      {/* Scrollable Form Body */}
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
                {project?.submittedBy?.username ? (
                  <>
                    This project was submitted by community member{" "}
                    <span className="font-semibold text-foreground">
                      @{project.submittedBy.username}
                    </span>
                    . Your changes will update the curriculum, content, roadmaps,
                    and status, while leaving the author&apos;s identity intact.
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

          {/* 1. Basic Information Card */}
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Basic Project Information
              </CardTitle>
              <CardDescription className="text-xs">
                Title, URL slug, high-level summary, difficulty, and project type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="project-title-input" className="text-xs">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="project-title-input"
                  placeholder="e.g. Build a Full-Stack Realtime Kanban Board"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Slug (only on create or optional edit) */}
              <div className="space-y-1.5">
                <Label htmlFor="project-slug-input" className="text-xs">
                  URL Slug {isEditing ? "(Read-only)" : "(Optional - auto-generated from title)"}
                </Label>
                <Input
                  id="project-slug-input"
                  placeholder="e.g. realtime-kanban-board"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={isEditing}
                  className={isEditing ? "bg-muted font-mono text-xs" : "font-mono text-xs"}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="project-desc-input" className="text-xs">
                  Short Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="project-desc-input"
                  placeholder="A concise summary of what learners will build and the primary concepts practiced..."
                  className="h-20 resize-none text-xs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Difficulty & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="project-difficulty-select" className="text-xs">
                    Difficulty Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={difficulty}
                    onValueChange={(val) =>
                      setDifficulty(val as AdminProjectDifficulty)
                    }
                  >
                    <SelectTrigger id="project-difficulty-select">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="project-type-input" className="text-xs">
                    Project Type
                  </Label>
                  <Input
                    id="project-type-input"
                    placeholder="e.g. Full Stack, Frontend, Backend, CLI, Tool"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Roadmaps & Classification Card */}
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Roadmaps & Categorization
              </CardTitle>
              <CardDescription className="text-xs">
                Select which roadmaps display this project, and tag relevant topics and skills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Roadmaps selector */}
              <div className="space-y-2">
                <Label className="text-xs">
                  Assigned Roadmaps <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {roadmapIds.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      No roadmaps assigned. Please choose at least one below.
                    </span>
                  ) : (
                    roadmapIds.map((rId) => (
                      <Badge
                        key={rId}
                        variant="secondary"
                        className="gap-1.5 py-1 px-2.5 text-xs font-mono"
                      >
                        {rId}
                        <button
                          type="button"
                          id={`remove-roadmap-${rId}-btn`}
                          onClick={() => handleRemoveRoadmap(rId)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                  <Select
                    value={selectedRoadmapToAdd}
                    onValueChange={(val) => {
                      handleAddRoadmap(val);
                    }}
                  >
                    <SelectTrigger id="add-roadmap-select" className="text-xs">
                      <SelectValue placeholder="Add to roadmap..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roadmaps
                        .filter((r) => !roadmapIds.includes(r.slug))
                        .map((r) => (
                          <SelectItem key={r.id || r.slug} value={r.slug}>
                            {r.title?.card || r.slug} ({r.slug})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Topics */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Topics
                </Label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {topics.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="gap-1.5 text-xs"
                    >
                      {t}
                      <button
                        type="button"
                        id={`remove-topic-${t}-btn`}
                        onClick={() => handleRemoveTopic(t)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <Input
                    id="add-topic-input"
                    placeholder="e.g. React, WebSockets, Prisma"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    id="add-topic-btn"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={handleAddTopic}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" />
                  Target Skills
                </Label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {skills.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="gap-1.5 text-xs font-mono"
                    >
                      {s}
                      <button
                        type="button"
                        id={`remove-skill-${s}-btn`}
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <Input
                    id="add-skill-input"
                    placeholder="e.g. State Management, Realtime Sync"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    id="add-skill-btn"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={handleAddSkill}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Detailed Guide & Content */}
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Project Content & Instructions
              </CardTitle>
              <CardDescription className="text-xs">
                In-depth curriculum, markdown guide, preview image, and tech stack recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview Image */}
              <div className="space-y-1.5">
                <Label htmlFor="project-preview-image-input" className="text-xs">
                  Preview Image URL (Optional)
                </Label>
                <div className="relative">
                  <Input
                    id="project-preview-image-input"
                    type="url"
                    placeholder="https://images.unsplash.com/... or CDN link"
                    value={previewImage}
                    onChange={(e) => setPreviewImage(e.target.value)}
                  />
                  {previewImage && (
                    <a
                      href={previewImage}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      title="Open image preview"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Overview */}
              <div className="space-y-1.5">
                <Label htmlFor="project-overview-input" className="text-xs">
                  Project Overview (Introductory guidance)
                </Label>
                <Textarea
                  id="project-overview-input"
                  placeholder="Provide an architectural overview, user stories, or problem background..."
                  className="h-24 resize-none text-xs"
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                />
              </div>

              {/* Markdown guide */}
              <div className="space-y-1.5">
                <Label htmlFor="project-markdown-input" className="text-xs">
                  Markdown Curriculum / Step-by-Step Guide
                </Label>
                <Textarea
                  id="project-markdown-input"
                  placeholder="Detailed markdown walkthrough, setup instructions, code snippets, and architecture advice..."
                  className="h-40 font-mono text-xs"
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                />
              </div>

              {/* Suggested Tech Stack */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5" />
                  Suggested Tech Stack
                </Label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {suggestedTechStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="gap-1.5 text-xs"
                    >
                      {tech}
                      <button
                        type="button"
                        id={`remove-tech-${tech}-btn`}
                        onClick={() => handleRemoveTech(tech)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <Input
                    id="add-tech-input"
                    placeholder="e.g. Next.js, Tailwind CSS, PostgreSQL"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    id="add-tech-btn"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={handleAddTech}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Requirements & Checklist Array Builders */}
          <Card className="border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                Requirements, Checklist & Bonus Challenges
              </CardTitle>
              <CardDescription className="text-xs">
                Build explicit criteria for students to complete this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Requirements Builder */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5">
                  <ListOrdered className="h-3.5 w-3.5" />
                  Core Requirements ({requirements.length})
                </Label>
                {requirements.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-muted/20 border rounded-md text-xs"
                      >
                        <span className="flex-1 text-foreground">
                          <span className="font-mono text-muted-foreground font-semibold mr-2">
                            {idx + 1}.
                          </span>
                          {req}
                        </span>
                        <Button
                          type="button"
                          id={`delete-req-btn-${idx}`}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveRequirement(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="add-requirement-input"
                    placeholder="Add a core functional requirement (e.g., Users must be able to create, edit, and drag cards)..."
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    id="add-requirement-btn"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={handleAddRequirement}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Checklist Builder */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-xs flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Step-by-Step Checklist ({checklist.length})
                </Label>
                {checklist.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-muted/20 border rounded-md text-xs"
                      >
                        <span className="flex-1 text-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {item}
                        </span>
                        <Button
                          type="button"
                          id={`delete-checklist-btn-${idx}`}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveChecklist(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="add-checklist-input"
                    placeholder="Add a checklist item (e.g., Initialize Git repository and install dependencies)..."
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddChecklist();
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    id="add-checklist-btn"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={handleAddChecklist}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Bonus Challenges Builder */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-xs flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Bonus Challenges ({bonusChallenges.length})
                </Label>
                {bonusChallenges.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {bonusChallenges.map((challenge, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-muted/20 border rounded-md text-xs"
                      >
                        <span className="flex-1 text-foreground">
                          <span className="font-mono text-primary font-semibold mr-2">
                            +
                          </span>
                          {challenge}
                        </span>
                        <Button
                          type="button"
                          id={`delete-bonus-btn-${idx}`}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveBonus(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="add-bonus-input"
                    placeholder="Add an optional stretch challenge (e.g., Add dark mode toggle or export to CSV)..."
                    value={bonusInput}
                    onChange={(e) => setBonusInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBonus();
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    id="add-bonus-btn"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={handleAddBonus}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Moderation & Publishing Status Card */}
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
                {/* Moderation Status */}
                <div className="space-y-1.5">
                  <Label htmlFor="project-moderation-status-select" className="text-xs">
                    Moderation Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(val) =>
                      setStatus(val as AdminProjectStatus)
                    }
                  >
                    <SelectTrigger id="project-moderation-status-select">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved (Live)</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="updated">Updated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Origin Attribution */}
                <div className="space-y-1.5">
                  <Label htmlFor="project-origin-attribution-select" className="text-xs">
                    Origin Attribution
                  </Label>
                  <Select
                    value={origin}
                    onValueChange={(val) =>
                      setOrigin(val as AdminProjectOrigin)
                    }
                  >
                    <SelectTrigger id="project-origin-attribution-select">
                      <SelectValue placeholder="Origin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">Official Project</SelectItem>
                      <SelectItem value="community">Community Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rejection Reason (shown if rejected) */}
              {status === "rejected" && (
                <div className="space-y-1.5 pt-2">
                  <Label
                    htmlFor="project-editor-rejection-reason"
                    className="text-xs text-destructive"
                  >
                    Rejection Reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="project-editor-rejection-reason"
                    placeholder="Explain clearly to the submitter why this project cannot be approved..."
                    className="h-20 resize-none text-xs border-destructive/40"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Admin Internal Notes */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="project-editor-admin-notes" className="text-xs">
                  Admin Internal Notes (Optional)
                </Label>
                <Textarea
                  id="project-editor-admin-notes"
                  placeholder="Private notes for the moderation team..."
                  className="h-16 resize-none text-xs"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              id="cancel-project-footer-btn"
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              id="save-project-footer-btn"
              type="submit"
              size="sm"
              disabled={isSaving || (isEditing && isLoadingProject)}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              {isSaving
                ? "Saving..."
                : isEditing
                ? "Update Project"
                : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

