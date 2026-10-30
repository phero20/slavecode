"use client";

import React from "react";
import { ArrowLeft, Loader2, Upload, RefreshCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceFormActionsProps {
  isCreate: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  onResetDraft?: () => void;
  onCancel: () => void;
}

export function ResourceFormActions({
  isCreate,
  isSubmitting,
  isValid,
  onResetDraft,
  onCancel,
}: ResourceFormActionsProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-border">
      <Button
        id="cancel-resource-bottom-btn"
        type="button"
        variant="ghost"
        onClick={onCancel}
        className="w-full sm:w-auto text-muted-foreground hover:text-foreground gap-1.5 h-9"
      >
        <ArrowLeft className="size-4 shrink-0" />
        <span>Cancel</span>
      </Button>

      <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
        {isCreate && onResetDraft && (
          <Button
            id="reset-resource-draft-bottom-btn"
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
          id="submit-resource-bottom-btn"
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
              <span>{isCreate ? "Submit Resource" : "Save Changes"}</span>
              {isCreate ? (
                <Upload className="size-3.5 shrink-0" />
              ) : (
                <Save className="size-3.5 shrink-0" />
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
