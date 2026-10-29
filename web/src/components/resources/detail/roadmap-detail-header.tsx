"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Check,
  Sparkles,
  GitFork,
  FolderGit2,
  Bot,
  BookOpen,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoadmapIcon } from "../shared/roadmap-icon";
import type { RoadmapDetail } from "@/types/resource";
import { tones } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface OpenTopicTab {
  id: string;
  label: string;
  legend?: {
    label?: string;
    color?: string;
  };
}

interface RoadmapDetailHeaderProps {
  roadmap: RoadmapDetail;
  openTopics?: OpenTopicTab[];
  onCloseTopic?: (topicId: string) => void;
}

export const RoadmapDetailHeader = ({
  roadmap,
  openTopics = [],
  onCloseTopic,
}: RoadmapDetailHeaderProps) => {
  const title = roadmap.title?.page || roadmap.title?.card || roadmap.slug;
  const currentYear = new Date().getFullYear().toString();
  const description = (roadmap.description || "").replace(
    /@currentYear@/g,
    currentYear
  );


  return (
    <div className="w-full bg-background relative z-10 border-b">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header Content matching Academy Track SlugHeader */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-6">
          {/* Left side: Icon & Title matching SlugHeader */}
          <div className="flex items-center gap-2 shrink-0">
            <RoadmapIcon
              slug={roadmap.slug}
              category={roadmap.category}
              index={0}
              size="card"
              className="shrink-0"
            />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
          </div>

          {/* Center: Blurb matching TrackOverviewTabs border-l-[3px] design */}
          {description && (
            <div className="flex-1 max-w-3xl pt-2 lg:pt-0">
              <p className="text-muted-foreground text-[14px] sm:text-base leading-relaxed border-l-[3px] border-border/70 pl-4 sm:pl-5 py-0.5">
                {description}
              </p>
            </div>
          )}
        </div>

        {/* TabsList matching Academy TrackOverviewTabs 1:1, including Back Trigger */}
        <TabsList className="w-full justify-start border-none rounded-none h-auto p-0 bg-transparent gap-4 sm:gap-8 mt-1 overflow-x-auto scrollbar-hide">
          <Link
            id="roadmap-back-btn"
            href="/resources"
            prefetch={true}
            className="rounded-none border-b-[3px] border-transparent px-0 py-3 sm:py-4 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 focus-visible:outline-none"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
            <span>Back</span>
          </Link>

          <TabsTrigger
            id="roadmap-tab-trigger"
            value="roadmap"
            className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 sm:py-4 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            <GitFork className="h-4 w-4 sm:h-5 sm:w-5" /> Roadmap
          </TabsTrigger>

          <TabsTrigger
            id="project-tab-trigger"
            value="project"
            className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 sm:py-4 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            <FolderGit2 className="h-4 w-4 sm:h-5 sm:w-5" /> Projects
          </TabsTrigger>

          <TabsTrigger
            id="ai-tutor-tab-trigger"
            value="ai-tutor"
            className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 sm:py-4 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            <Bot className="h-4 w-4 sm:h-5 sm:w-5" /> AI Tutor
          </TabsTrigger>

          {/* Dynamic Open Topic Tabs */}
          {openTopics.map((topic, index) => {
            const tone = tones[index % tones.length];
            return (
              <TabsTrigger
                key={topic.id}
                value={`topic-${topic.id}`}
                id={`topic-tab-trigger-${topic.id}`}
                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 sm:py-4 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 group pr-1"
              >
                <BookOpen className={cn("h-4 w-4", tone.accent)} />
                <span className="truncate max-w-30 sm:max-w-45">
                  {topic.label}
                </span>
                {onCloseTopic && (
                  <Badge
                    variant="outline"
                    tabIndex={0}
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCloseTopic(topic.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        onCloseTopic(topic.id);
                      }
                    }}
                    className="ml-1 p-0.5 rounded-sm border-none bg-transparent hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    aria-label={`Close ${topic.label} tab`}
                  >
                    <X className="w-4 h-4" />
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </div>
  );
};
