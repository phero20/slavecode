"use client";

import React from "react";
import { TrackConfigResponse } from "@/types/academy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, ListTree, X, BookOpen } from "lucide-react";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { TimelineView } from "./timeline-view";
import { GraphView } from "./graph-view";
import { ConceptView } from "./concept-view";
import { Badge } from "@/components/ui/badge";
import { useSlugLearnTabs } from "./hooks";

export interface SlugLearnTabProps {
  config: TrackConfigResponse;
  solvedExercises?: string[];
}

export function SlugLearnTab({
  config,
  solvedExercises = [],
}: SlugLearnTabProps) {
  const {
    levels,
    edges,
    showGraph,
    activeTab,
    activeConcepts,
    conceptProgressMap,
    setActiveTab,
    handleConceptClick,
    handleCloseConcept,
  } = useSlugLearnTabs(config, solvedExercises);

  return (
    <QueryGuard
      loading={false}
      error={null}
      data={levels}
      emptyIcon={BookOpen}
      emptyTitle="Concept Graph Coming Soon..."
      emptyMessage="We’re still mapping the learning path for this track."
    >
      <div className="w-full max-w-7xl mx-auto min-h-screen">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Center Area: Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Your journey through{" "}
              <span className="text-primary">{config.language}</span>
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Learn and master concepts to achieve fluency in {config.language}.
            </p>
          </div>

          {/* Dynamic Tabs Bar */}
          <div className="flex justify-start mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="p-2 h-12 bg-muted shadow-none inline-flex min-w-max">
              {/* Base Tabs */}
              <TabsTrigger
                value="timeline"
                className="h-9 data-[state=active]:text-primary shadow-none flex items-center gap-2"
              >
                <ListTree className="w-4 h-4" /> Timeline
              </TabsTrigger>

              {showGraph && (
                <TabsTrigger
                  value="graph"
                  className="h-9 data-[state=active]:text-primary shadow-none flex items-center gap-2"
                >
                  <Network className="w-4 h-4" /> Graph
                </TabsTrigger>
              )}

              {/* Dynamic Concept Tabs */}
              {activeConcepts.map((concept) => (
                <TabsTrigger
                  key={concept.slug}
                  value={concept.slug}
                  className="h-9 data-[state=active]:text-primary shadow-none flex items-center gap-2 pr-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="capitalize">{concept.name}</span>
                  <Badge
                    variant="outline"
                    className="ml-1 p-0.5 rounded-sm hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors cursor-pointer"
                    onClick={(e) => handleCloseConcept(e, concept.slug)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content Panes — forceMount keeps GraphView & TimelineView alive without tearing down DOM */}
          <TabsContent
            value="timeline"
            forceMount
            className="mt-0 focus-visible:outline-none focus-visible:ring-0 data-[state=inactive]:hidden"
          >
            <TimelineView
              levels={levels}
              onConceptClick={handleConceptClick}
              conceptProgressMap={conceptProgressMap}
            />
          </TabsContent>

          {showGraph && (
            <TabsContent
              value="graph"
              forceMount
              className="mt-0 focus-visible:outline-none focus-visible:ring-0 data-[state=inactive]:hidden"
            >
              <GraphView
                levels={levels}
                edges={edges}
                onConceptClick={handleConceptClick}
                conceptProgressMap={conceptProgressMap}
                idPrefix="learn"
              />
            </TabsContent>
          )}

          {/* Dynamic Concept Content Panes */}
          {activeConcepts.map((concept) => (
            <TabsContent
              key={`content-${concept.slug}`}
              value={concept.slug}
              forceMount
              className="mt-0 focus-visible:outline-none focus-visible:ring-0 data-[state=inactive]:hidden"
            >
              <ConceptView
                trackSlug={config.slug}
                conceptSlug={concept.slug}
                exercises={config.exercises?.concept}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </QueryGuard>
  );
}