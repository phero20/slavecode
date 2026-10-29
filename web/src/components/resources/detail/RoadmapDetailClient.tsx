"use client";

import React from "react";
import type { RoadmapDetail } from "@/types/resource";
import { RoadmapDetailHeader } from "./roadmap-detail-header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FolderGit2, Bot, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoadmapCanvas } from "./canvas/RoadmapCanvas";
import { RoadmapTopicView } from "./topic/roadmap-topic-view";
import { RoadmapProjectsView } from "./projects/RoadmapProjectsView";
import { tones } from "@/lib/tones";
import { cn } from "@/lib/utils";
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

          {/* TAB 3: AI TUTOR (Dummy content placeholder) */}
          <TabsContent
            value="ai-tutor"
            id="tab-content-ai-tutor"
            className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-7xl mt-12 mb-24 space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <span>AI Tutor for {title}</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Your dedicated AI mentor to answer roadmap questions, clarify
                concepts, and review code.
              </p>
            </div>

            {/* AI Tutor Card */}
            <Card className="border-border/60 bg-card/60">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">
                      SlaveCode AI Mentor
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      Hello! I&apos;m your personal tutor for {title}. What
                      concept would you like to explore today?
                    </div>
                  </div>
                </div>

                {/* Sample Prompt Chips */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Try asking:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      id="ai-tutor-chip-1"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-full bg-secondary/30 hover:bg-secondary/60"
                      disabled
                    >
                      &quot;Explain the top 3 fundamental concepts to learn
                      first&quot;
                    </Button>
                    <Button
                      id="ai-tutor-chip-2"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-full bg-secondary/30 hover:bg-secondary/60"
                      disabled
                    >
                      &quot;Give me a weekly study schedule for this
                      roadmap&quot;
                    </Button>
                    <Button
                      id="ai-tutor-chip-3"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-full bg-secondary/30 hover:bg-secondary/60"
                      disabled
                    >
                      &quot;Test my understanding with 3 quiz questions&quot;
                    </Button>
                  </div>
                </div>

                {/* Mock Chat Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <input
                    id="ai-tutor-mock-input"
                    type="text"
                    placeholder={`Ask AI Tutor about ${title}...`}
                    disabled
                    className="flex-1 bg-muted/40 border border-border/60 rounded-lg px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none cursor-not-allowed"
                  />
                  <Button
                    id="ai-tutor-mock-submit-btn"
                    size="sm"
                    className="h-9 px-3 gap-1.5"
                    disabled
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs">Send</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
