"use client";

import React from "react";
import { ArrowLeft, Loader2, Sparkles, Layers, Edit, RefreshCcw, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectFormHeaderProps {
  isCreate: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  onResetDraft?: () => void;
  onBack: () => void;
}

export function ProjectFormHeader({
  isCreate,
  isSubmitting,
  isValid,
  onResetDraft,
  onBack,
}: ProjectFormHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
      <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
        <Button
          id="back-to-projects-btn"
          type="button"
          variant="outline"
          size="icon"
          onClick={onBack}
          title="Go back"
          className="shrink-0 mt-0.5 sm:mt-0"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {isCreate ? (
                <>
                  <Edit className="w-5 h-5 text-primary shrink-0" />
                  <span>Create Project</span>
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5 text-primary shrink-0" />
                  <span>Edit Project</span>
                </>
              )}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {isCreate
              ? "Share a hands-on project idea with the developer community to build and showcase."
              : "Update requirements, guidance, and metadata for this project."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
        {isCreate && onResetDraft && (
          <Button
            id="discard-draft-btn"
            type="button"
            variant="outline"
            onClick={onResetDraft}
            className="flex-1 sm:flex-initial text-foreground gap-1.5 text-xs font-medium h-9"
          >
            <RefreshCcw className="size-3.5 shrink-0" />
            <span>Reset Draft</span>
          </Button>
        )}

        <Button
          id="submit-project-top-btn"
          type="submit"
          disabled={isSubmitting || !isValid}
          className="flex-1 sm:flex-initial text-xs font-semibold px-4 transition-all gap-1.5 h-9"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin shrink-0" />
              <span>{isCreate ? "Publishing..." : "Saving..."}</span>
            </>
          ) : (
            <>
              <span>{isCreate ? "Publish Project" : "Save Changes"}</span>
              {isCreate ? <Upload className="size-3.5 shrink-0" /> : <Save className="size-3.5 shrink-0" />}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
