"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ConceptViewSkeleton } from "@/components/skeletons/AcademySkeletons";
import { BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PracticeProblemCard } from "@/components/academy/tracks/practice/practice-problem-card";
import {
  useConceptView,
  useConceptMarkdownComponents,
  type ConceptExercise,
} from "./hooks";

export interface ConceptViewProps {
  trackSlug: string;
  conceptSlug: string;
  exercises?: ConceptExercise[];
}

export function ConceptView({
  trackSlug,
  conceptSlug,
  exercises = [],
}: ConceptViewProps) {
  const {
    concept,
    isLoading,
    error,
    markdown,
    referenceLinks,
    relatedExercises,
  } = useConceptView({ trackSlug, conceptSlug, exercises });

  const markdownComponents = useConceptMarkdownComponents();

  return (
    <QueryGuard
      loading={isLoading}
      error={error}
      data={concept}
      skeleton={<ConceptViewSkeleton />}
      emptyIcon={BookOpen}
      emptyTitle="Concept Not Found"
      emptyMessage="The requested concept documentation could not be retrieved."
    >
      {(concept) => (
        <div className="w-full max-w-4xl mx-auto py-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground capitalize">
              {concept.name}
            </h1>
            <p className="text-muted-foreground">Concept Documentation</p>
          </div>

          <div className="prose dark:prose-invert max-w-none w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          </div>

          {relatedExercises.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold">Practice challenges</h3>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {relatedExercises.map((exercise) => (
                  <PracticeProblemCard key={exercise.slug} exercise={exercise} />
                ))}
              </div>
            </div>
          )}

          {referenceLinks.length > 0 && (
            <div className="mt-12 pt-6 border-t">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold">Learn more</h3>
                <Badge variant="secondary" className="py-1">
                  {referenceLinks.length} links
                </Badge>
              </div>
              <ul className="flex flex-wrap gap-3">
                {referenceLinks.map((link) => (
                  <li key={link.label} className="list-none">
                    <Badge variant="outline" className="px-3 py-1.5">
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="h-3 w-3 mb-0.5" />
                      </a>
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </QueryGuard>
  );
}
