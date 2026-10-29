"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { RoadmapTopicSkeleton } from "@/components/skeletons";
import { TopicHeader } from "./topic-header";
import { TopicContent } from "./topic-content";
import { TopicResources } from "./topic-resources";
import { useTopicView } from "./hooks";

interface RoadmapTopicViewProps {
  roadmapSlug: string;
  roadmapTitle: string;
  topicId: string;
  topicLabel: string;
  legend?: {
    label?: string;
    color?: string;
  };
  onBackToRoadmap?: () => void;
}

export function RoadmapTopicView({
  roadmapSlug,
  topicId,
  topicLabel,
  legend,
}: RoadmapTopicViewProps) {
  const {
    displayTitle,
    description,
    resources,
    tone,
    topicData,
    isLoading,
    error,
    refetch,
  } = useTopicView({
    roadmapSlug,
    topicId,
    topicLabel,
  });

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      <QueryGuard
        loading={isLoading}
        error={error}
        data={topicData}
        isEmpty={!topicData}
        skeleton={<RoadmapTopicSkeleton />}
        onRetry={() => refetch()}
        emptyIcon={BookOpen}
        emptyTitle="Topic details unavailable"
        emptyMessage={`No guide or resources are currently available for "${displayTitle}".`}
      >
        {/* Topic Header (Title + optional legend badge) */}
        <TopicHeader title={displayTitle} legend={legend} tone={tone} />

        {/* Markdown Content Body */}
        <TopicContent description={description} />

        {/* Resources Section with Dynamic Underline Tabs & Cards Grid */}
        <TopicResources resources={resources} />
      </QueryGuard>
    </div>
  );
}

export default RoadmapTopicView;

