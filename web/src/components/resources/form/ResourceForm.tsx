"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useRoadmapResourceForm } from "@/hooks/use-roadmap-resource-form";
import type { CreateRoadmapResourcePayload } from "@/types/roadmap-resource";

import { ResourceFormHeader } from "./resource-form-header";
import { ResourceFormBasicInfo } from "./resource-form-basic-info";
import { ResourceFormTaxonomy } from "./resource-form-taxonomy";
import { ResourceFormActions } from "./resource-form-actions";
import { Separator } from "@/components/ui/separator";

export interface ResourceFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CreateRoadmapResourcePayload>;
  initialRoadmapIds?: string[];
  onSubmit: (data: CreateRoadmapResourcePayload) => Promise<void>;
}

export function ResourceForm({
  mode,
  initialData,
  initialRoadmapIds,
  onSubmit,
}: ResourceFormProps) {
  const router = useRouter();

  const {
    title,
    setTitle,
    description,
    setDescription,
    url,
    setUrl,
    type,
    setType,
    author,
    setAuthor,
    roadmapIds,
    toggleRoadmapId,

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
  } = useRoadmapResourceForm({
    mode,
    initialData,
    initialRoadmapIds,
    onSubmit,
  });

  const handleBack = () => {
    router.back();
  };

  return (
    <form
      id="resource-form"
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-10"
    >
      <ResourceFormHeader
        isCreate={isCreate}
        isSubmitting={isSubmitting}
        isValid={isValid}
        onResetDraft={isCreate ? resetDraft : undefined}
        onBack={handleBack}
      />

      <ResourceFormBasicInfo
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        url={url}
        setUrl={setUrl}
        type={type}
        setType={setType}
        author={author}
        setAuthor={setAuthor}
        bannerPreview={bannerPreview}
        isDragActive={isDragActive}
        handleBannerDrag={handleBannerDrag}
        handleBannerDrop={handleBannerDrop}
        handleBannerChange={handleBannerChange}
        clearBanner={clearBanner}
      />

      <Separator />

      <ResourceFormTaxonomy
        roadmapIds={roadmapIds}
        toggleRoadmapId={toggleRoadmapId}
      />

      <ResourceFormActions
        isCreate={isCreate}
        isSubmitting={isSubmitting}
        isValid={isValid}
        onResetDraft={isCreate ? resetDraft : undefined}
        onCancel={handleBack}
      />
    </form>
  );
}
