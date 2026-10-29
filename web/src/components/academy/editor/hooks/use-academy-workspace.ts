"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TrackExerciseResponse, ExerciseRunResult } from "@/types/academy";
import type { Problem } from "@/types/api";
import { useRunAcademyExerciseMutation } from "@/hooks/mutations/use-academy.mutations";
import { useEditorStore } from "@/store/use-editor-store";

export interface UseAcademyWorkspaceOptions {
  exercise: TrackExerciseResponse;
  trackSlug: string;
}

export interface UseAcademyWorkspaceResult {
  problemData: Problem;
  runResult: ExerciseRunResult | null;
  runError: Error | null;
  isPending: boolean;
  activeTab: "code" | "testcase" | "result";
  setActiveTab: (tab: "code" | "testcase" | "result") => void;
  handleRun: () => void;
  handleSubmit: () => void;
  handleExit: () => void;
}

export function useAcademyWorkspace({
  exercise,
  trackSlug,
}: UseAcademyWorkspaceOptions): UseAcademyWorkspaceResult {
  const router = useRouter();

  // Map the Academy TrackExerciseResponse to the Problem interface expected by workspace-shared
  const problemData = useMemo<Problem>(() => {
    return {
      problem_id: exercise.id, // Use slug as ID
      title: exercise.name,
      difficulty: exercise.difficulty as any,
      problem_slug: exercise.slug,
      topics: exercise.concepts ?? [],
      description: exercise.instructions || exercise.blurb || "",
      examples: [],
      constraints: [],
      follow_ups: [],
      hints: exercise.hints ? [exercise.hints] : [],
      code_snippets: {
        [trackSlug]: exercise.starter_code || "",
      },
      function_signature: {
        name: "",
        return_type: "",
        params: [],
      },
      solutions: exercise.example_solution || undefined,
      source: exercise.source || undefined,
      source_url: exercise.source_url || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [exercise, trackSlug]);

  const [runResult, setRunResult] = useState<ExerciseRunResult | null>(null);
  const [runError, setRunError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "testcase" | "result">("code");

  const { mutate: runExercise, isPending } = useRunAcademyExerciseMutation({
    trackSlug,
    exerciseSlug: exercise.slug,
  });

  const handleRun = () => {
    const sessionId = `academy:${exercise.id}`;
    const session = useEditorStore.getState().sessions[sessionId];

    const snippetLanguages = Object.keys(problemData.code_snippets || {});
    const fallbackLang =
      snippetLanguages.length > 0 ? snippetLanguages[0] : trackSlug;
    const currentLanguage = session?.activeLanguage || fallbackLang;

    const userCode = session?.codes[currentLanguage] || "";

    runExercise(
      { userCode, testCode: exercise.test_code || "" },
      {
        onSuccess: (data) => {
          setRunResult(data);
          setRunError(null);
          setActiveTab("result");
        },
        onError: (err) => {
          setRunError(err);
          setRunResult(null);
          setActiveTab("result");
        },
      }
    );
  };

  const handleSubmit = () => {
    handleRun();
  };

  const handleExit = () => {
    router.push(`/academy/tracks/${trackSlug}?tab=practice`);
  };

  return {
    problemData,
    runResult,
    runError,
    isPending,
    activeTab,
    setActiveTab,
    handleRun,
    handleSubmit,
    handleExit,
  };
}
