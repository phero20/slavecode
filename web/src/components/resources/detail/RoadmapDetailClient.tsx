"use client";

import React from "react";
import type { RoadmapDetail } from "@/types/resource";
import { RoadmapDetailHeader } from "./roadmap-detail-header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Bot, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoadmapCanvas } from "./canvas/RoadmapCanvas";
import { RoadmapTopicView } from "./topic/roadmap-topic-view";
import { RoadmapProjectsView } from "./projects/RoadmapProjectsView";
import { RoadmapResourcesView } from "./library/RoadmapResourcesView";
import { EmptyDisplay } from "@/components/shared/StatusState";
import { useRoadmapDetailTabs } from "./hooks";

interface RoadmapDetailClientProps {
  roadmap: RoadmapDetail;
}

export function RoadmapDetailClient({ roadmap }: RoadmapDetailClientProps) {
  const {
    activeTab,
    openTopics,
    title,
    handleTabChange,
    handleSelectTopic,
    handleCloseTopic,
  } = useRoadmapDetailTabs(roadmap);

  return (
    <div
      id="roadmap-detail-container"
      className="flex flex-col min-h-screen bg-background py-20"
    >
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Top Header & Tabs Row matching TrackOverviewTabs */}
        <RoadmapDetailHeader
          roadmap={roadmap}
          openTopics={openTopics}
          onCloseTopic={handleCloseTopic}
        />

        {/* Tab Contents matching TrackOverviewTabs structure */}
        <div className="w-full">
          {/* TAB 1: ROADMAP DIAGRAM (Fixed layout, page-scrollable, kept mounted for instant 0ms switching) */}
          <TabsContent
            value="roadmap"
            id="tab-content-roadmap"
            forceMount
            className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-2 sm:px-4 md:px-6 max-w-7xl mt-3 sm:mt-5 mb-16 sm:mb-24 data-[state=inactive]:hidden"
          >
            <RoadmapCanvas roadmap={roadmap} onSelectTopic={handleSelectTopic} />
          </TabsContent>

          {/* DYNAMIC TOPIC TABS */}
          {openTopics.map((topic) => (
            <TabsContent
              key={`content-${topic.id}`}
              value={`topic-${topic.id}`}
              id={`tab-content-topic-${topic.id}`}
              forceMount
              className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-5xl mt-6 sm:mt-10 mb-24 data-[state=inactive]:hidden"
            >
              <RoadmapTopicView
                roadmapSlug={roadmap.slug}
                roadmapTitle={title}
                topicId={topic.id}
                topicLabel={topic.label}
                legend={topic.legend}
                onBackToRoadmap={() => handleTabChange("roadmap")}
              />
            </TabsContent>
          ))}

          {/* TAB 2: PROJECTS */}
          <TabsContent
            value="project"
            id="tab-content-projects"
            className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-7xl mt-8 sm:mt-12 mb-24"
          >
            <RoadmapProjectsView
              roadmapSlug={roadmap.slug}
              roadmapTitle={title}
            />
          </TabsContent>

          {/* TAB 3: RESOURCES */}
          <TabsContent
            value="resources"
            id="tab-content-resources"
            className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-7xl mt-8 sm:mt-12 mb-24"
          >
            <RoadmapResourcesView
              roadmapSlug={roadmap.slug}
              roadmapTitle={title}
            />
          </TabsContent>

          {/* TAB 4: AI TUTOR */}
          <TabsContent
            value="ai-tutor"
            id="tab-content-ai-tutor"
            className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-7xl mt-8 sm:mt-12 mb-24"
          >
            <EmptyDisplay
              icon={Bot}
              title="Coming Soon"
              message="AI Tutor for this roadmap is on the way. Share what you'd like it to do."
              className="m-0 min-h-[320px]"
              action={
                <Button
                  id="ai-tutor-suggest-ideas-btn"
                  asChild
                  size="sm"
                  className="text-xs h-8 cursor-pointer"
                >
                  <Link href="/report-bug">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Suggest Ideas</span>
                  </Link>
                </Button>
              }
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
