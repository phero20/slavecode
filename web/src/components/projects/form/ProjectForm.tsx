"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useProjectForm } from "@/hooks/use-project-form";
import type { CreateProjectPayload } from "@/types/project";

import { ProjectFormHeader } from "./project-form-header";
import { ProjectFormBasicInfo } from "./project-form-basic-info";
import { ProjectFormTaxonomy } from "./project-form-taxonomy";
import { ProjectFormRequirements } from "./project-form-requirements";
import { ProjectFormGuide } from "./project-form-guide";
import { ProjectFormActions } from "./project-form-actions";
import { Separator } from "@/components/ui/separator";

export interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CreateProjectPayload>;
  projectSlug?: string;
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
}

export function ProjectForm({
  mode,
  initialData,
  onSubmit,
}: ProjectFormProps) {
  const router = useRouter();

  const {
    title,
    setTitle,
    description,
    setDescription,
    difficulty,
    setDifficulty,
    roadmapIds,
    toggleRoadmapId,
    topics,
    addTopic,
    removeTopic,
    skills,
    addSkill,
    removeSkill,
    overview,
    setOverview,
    markdown,
    setMarkdown,
    requirements,
    addRequirement,
    removeRequirement,
    checklist,
    addChecklistItem,
    removeChecklistItem,
    suggestedTechStack,
    addSuggestedTech,
    removeSuggestedTech,

    bannerPreview,
    isDragActive,
    handleBannerDrag,
    handleBannerDrop,
    handleBannerChange,
    clearBanner,

    isSubmitting,
    isValid,
    handleSubmit,
    resetDraft,
    isCreate,
  } = useProjectForm({ mode, initialData, onSubmit });

  const handleBack = () => {
    router.back();
  };

  return (
    <form
      id="project-form"
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-10"
    >
      {/* 1. Header & Primary Quick Actions */}
      <ProjectFormHeader
        isCreate={isCreate}
        isSubmitting={isSubmitting}
        isValid={isValid}
        onResetDraft={isCreate ? resetDraft : undefined}
        onBack={handleBack}
      />

      {/* 2. Basic Information (Title, Pitch, Difficulty & Banner Upload) */}
      <ProjectFormBasicInfo
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        bannerPreview={bannerPreview}
        isDragActive={isDragActive}
        handleBannerDrag={handleBannerDrag}
        handleBannerDrop={handleBannerDrop}
        handleBannerChange={handleBannerChange}
        clearBanner={clearBanner}
      />

      <Separator />

      {/* 3. Taxonomy & Categorization (Roadmaps, Topics, Skills) */}
      <ProjectFormTaxonomy
        roadmapIds={roadmapIds}
        toggleRoadmapId={toggleRoadmapId}
        topics={topics}
        addTopic={addTopic}
        removeTopic={removeTopic}
        skills={skills}
        addSkill={addSkill}
        removeSkill={removeSkill}
      />

      <Separator />

      {/* 4. Requirements & Milestone Checklist */}
      <ProjectFormRequirements
        requirements={requirements}
        addRequirement={addRequirement}
        removeRequirement={removeRequirement}
        checklist={checklist}
        addChecklistItem={addChecklistItem}
        removeChecklistItem={removeChecklistItem}
        suggestedTechStack={suggestedTechStack}
        addSuggestedTech={addSuggestedTech}
        removeSuggestedTech={removeSuggestedTech}
      />

      <Separator />

      {/* 5. Overview & Markdown Guide */}
      <ProjectFormGuide
        overview={overview}
        setOverview={setOverview}
        markdown={markdown}
        setMarkdown={setMarkdown}
      />

      {/* 6. Bottom Action Bar */}
      <ProjectFormActions
        isCreate={isCreate}
        isSubmitting={isSubmitting}
        isValid={isValid}
        onResetDraft={isCreate ? resetDraft : undefined}
        onCancel={handleBack}
      />
    </form>
  );
}
