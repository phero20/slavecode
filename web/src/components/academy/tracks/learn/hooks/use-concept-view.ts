"use client";

import { useEffect, useMemo } from "react";
import { useTrackConceptQuery } from "@/hooks/queries/use-academy.queries";
import type { PracticeExercise, TrackConceptResponse } from "@/types/academy";

export type ConceptExercise = PracticeExercise & {
  concepts?: string[];
};

export type ReferenceLink = {
  label: string;
  href: string;
};

const referenceLinkPattern = /^\[([^\]]+)\]:\s+(\S+)\s*$/gm;

function extractReferenceLinks(markdown: string): ReferenceLink[] {
  const links = new Map<string, ReferenceLink>();

  for (const match of markdown.matchAll(referenceLinkPattern)) {
    const label = match[1].trim();
    const href = match[2].trim();

    if (!links.has(label)) {
      links.set(label, { label, href });
    }
  }

  return Array.from(links.values());
}

export interface UseConceptViewOptions {
  trackSlug: string;
  conceptSlug: string;
  exercises?: ConceptExercise[];
}

export interface UseConceptViewResult {
  concept: TrackConceptResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  markdown: string;
  referenceLinks: ReferenceLink[];
  relatedExercises: ConceptExercise[];
}

export function useConceptView({
  trackSlug,
  conceptSlug,
  exercises = [],
}: UseConceptViewOptions): UseConceptViewResult {
  const {
    data: concept,
    isLoading,
    error,
  } = useTrackConceptQuery(trackSlug, conceptSlug);

  useEffect(() => {
    window.scrollTo({ top: 10, behavior: "auto" });
  }, [trackSlug, conceptSlug]);

  const { markdown, referenceLinks } = useMemo(() => {
    const combinedMarkdown = `${concept?.introduction ?? ""}\n\n---\n\n${concept?.about ?? ""}`;
    return {
      markdown: combinedMarkdown,
      referenceLinks: extractReferenceLinks(combinedMarkdown),
    };
  }, [concept?.about, concept?.introduction]);

  const relatedExercises = useMemo(() => {
    return exercises.filter(
      (exercise) =>
        exercise.status !== "deprecated" &&
        Array.isArray(exercise.concepts) &&
        exercise.concepts.includes(conceptSlug)
    );
  }, [conceptSlug, exercises]);

  return {
    concept,
    isLoading,
    error,
    markdown,
    referenceLinks,
    relatedExercises,
  };
}
