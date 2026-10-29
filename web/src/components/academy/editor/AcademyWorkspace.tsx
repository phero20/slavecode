"use client";

import React from "react";
import { DescriptionPanel } from "@/components/workspace-shared";
import { AcademyEditorPanel } from "./AcademyEditorPanel";
import { BaseWorkspace } from "@/components/shared/BaseWorkspace";
import type { TrackExerciseResponse } from "@/types/academy";
import { useAcademyWorkspace } from "./hooks";

export interface AcademyWorkspaceProps {
  exercise: TrackExerciseResponse;
  trackSlug: string;
}

export const AcademyWorkspace: React.FC<AcademyWorkspaceProps> = ({
  exercise,
  trackSlug,
}) => {
  const {
    problemData,
    runResult,
    runError,
    isPending,
    activeTab,
    setActiveTab,
    handleRun,
    handleSubmit,
    handleExit,
  } = useAcademyWorkspace({ exercise, trackSlug });

  return (
    <BaseWorkspace
      problem={problemData}
      onRun={handleRun}
      onSubmit={handleSubmit}
      onExit={handleExit}
      exitText={`Practice`}
      isLoading={false}
      isSubmitting={isPending}
      hideRun={true}
      descriptionSlot={
        <DescriptionPanel
          mode="exercise"
          problem={problemData}
          trackSlug={trackSlug}
        />
      }
      editorSlot={
        <AcademyEditorPanel
          exercise={exercise}
          problemData={problemData}
          trackSlug={trackSlug}
          runResult={runResult}
          isExecutionRunning={isPending}
          runError={runError}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
    />
  );
};
