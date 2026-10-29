"use client";

import React, { useState, useCallback } from "react";
import { useCreateSolution, useUpdateSolution } from "@/hooks/mutations/use-solution.mutations";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/shared/markdown";

// Components
import { SolutionEditorHeader } from "./components/SolutionEditorHeader";

// Constants
import { INITIAL_SOLUTION_TEMPLATE } from "./constants/solution.constants";

interface SolutionEditorProps {
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  onSuccess?: () => void;
  solutionId?: string;
  initialTitle?: string;
  initialContent?: string;
}

export const SolutionEditor: React.FC<SolutionEditorProps> = ({
  problemId,
  problemTitle,
  problemSlug,
  onSuccess,
  solutionId,
  initialTitle = "",
  initialContent = INITIAL_SOLUTION_TEMPLATE,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const { mutate: createSolution, isPending: isCreating } = useCreateSolution(problemId);
  const { mutate: updateSolution, isPending: isUpdating } = useUpdateSolution(problemId);
  const isPending = isCreating || isUpdating;
  const isEditMode = !!solutionId;

  const handleSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error("Please provide both a title and content.");
      return;
    }

    if (trimmedTitle.length < 5) {
      toast.error("Title must be at least 5 characters long.");
      return;
    }

    if (trimmedContent.length < 20) {
      toast.error("Content must be at least 20 characters long.");
      return;
    }

    if (isEditMode && solutionId) {
      updateSolution(
        { solutionId, data: { title: trimmedTitle, content: trimmedContent, language: "markdown" } },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to update.");
          },
        },
      );
    } else {
      createSolution(
        { 
          title: trimmedTitle, 
          content: trimmedContent, 
          language: "markdown",
          problemTitle,
          problemSlug
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to publish.");
          },
        },
      );
    }
  }, [title, content, isEditMode, solutionId, createSolution, updateSolution, onSuccess]);

  return (
    <div className="solution-editor-root p-4">
      <SolutionEditorHeader
        title={title}
        setTitle={setTitle}
        isEditMode={isEditMode}
        isPending={isPending}
        onPublish={handleSubmit}
      />

      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="Write your solution..."
        defaultCodeLanguage="java"
        minHeight="400px"
        autofocus
      />
    </div>
  );
};
