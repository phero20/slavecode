"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectDetailQuery } from "@/hooks/queries/use-project.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ProjectDetailSkeleton } from "@/components/skeletons/ProjectsSkeletons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Info, BookOpen, ListChecks } from "lucide-react";
import {
  ProjectHeader,
  ProjectMedia,
  ProjectOverview,
  ProjectRequirements,
  ProjectChecklist,
  ProjectMeta,
  ProjectGuide,
} from "./content";
import type {
  RoadmapProjectItem,
  PaginatedProjectsResponse,
} from "@/types/project";
import { Separator } from "../ui/separator";

export interface ProjectDetailViewProps {
  slug: string;
  initialProject?: RoadmapProjectItem;
}

const VALID_TABS = ["overview", "guide", "requirements"] as const;
type ProjectTab = (typeof VALID_TABS)[number];

export function ProjectDetailView({
  slug,
  initialProject,
}: ProjectDetailViewProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Instant cache lookup: check initialProject, then query cache, then catalog cache
  const cachedInitialData = useMemo(() => {
    if (initialProject) return initialProject;

    const directCached = queryClient.getQueryData<RoadmapProjectItem>([
      "resources-project-detail",
      slug,
    ]);
    if (directCached) return directCached;

    const catalogQueries = queryClient.getQueriesData<PaginatedProjectsResponse>({
      queryKey: ["resources-projects-catalog"],
    });

    for (const [, responseData] of catalogQueries) {
      const match = responseData?.projects?.find((p) => p.slug === slug);
      if (match) return match;
    }

    return undefined;
  }, [queryClient, slug, initialProject]);

  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useProjectDetailQuery(slug, {
    initialData: cachedInitialData,
  });

  // Calculate which tabs actually contain content
  const hasOverviewContent = Boolean(
    project?.content?.overview?.trim() ||
      project?.content?.previewImage ||
      project?.roadmapIds?.length ||
      project?.topics?.length ||
      project?.skills?.length ||
      project?.content?.suggestedTechStack?.length
  );

  const hasGuideContent = Boolean(project?.content?.markdown?.trim());

  const hasRequirementsContent = Boolean(
    (project?.content?.requirements && project.content.requirements.length > 0) ||
      (project?.content?.checklist && project.content.checklist.length > 0)
  );

  const availableTabs = useMemo(() => {
    if (!project) return VALID_TABS;
    const tabs: ProjectTab[] = [];
    if (hasOverviewContent) tabs.push("overview");
    if (hasGuideContent) tabs.push("guide");
    if (hasRequirementsContent) tabs.push("requirements");
    return tabs.length > 0 ? tabs : (["overview"] as ProjectTab[]);
  }, [project, hasOverviewContent, hasGuideContent, hasRequirementsContent]);

  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");

  // Keep active tab in sync with URL and available non-empty tabs
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const target = tabParam === "about" ? "overview" : (tabParam as ProjectTab);
    if (target && availableTabs.includes(target)) {
      setActiveTab(target);
    } else if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || "overview");
    }
  }, [searchParams, availableTabs, activeTab]);

  // Handle instant 0ms tab changes while keeping URL in sync
  const handleTabChange = useCallback(
    (newTab: string) => {
      const target = newTab === "about" ? "overview" : (newTab as ProjectTab);
      const valid = availableTabs.includes(target)
        ? target
        : availableTabs[0] || "overview";
      setActiveTab(valid);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", valid);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [availableTabs],
  );

  return (
    <QueryGuard
      loading={isLoading && !project}
      error={error}
      data={project}
      skeleton={<ProjectDetailSkeleton />}
      onRetry={() => refetch()}
      errorTitle="Project Not Found"
      errorMessage="We couldn't retrieve the details for this project. It may have been relocated or updated."
    >
      {project && (
        <div className="w-full min-h-screen flex flex-col bg-background pt-16 animate-in fade-in-50 duration-200">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full flex flex-col"
          >
            {/* Top Header & Underline Tabs Row matching Academy Tracks */}
            <div className="w-full bg-background relative z-10 border-b border-border">
              <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                <ProjectHeader project={project} />

                {/* Tab Navigation List */}
                <TabsList className="w-full justify-start border-none rounded-none h-auto p-0 bg-transparent gap-6 sm:gap-8 mt-6 overflow-auto">
                  {hasOverviewContent && (
                    <TabsTrigger
                      id="project-tab-overview"
                      value="overview"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3.5 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none"
                    >
                      <Info className="h-4 w-4" />
                      <span>Overview</span>
                    </TabsTrigger>
                  )}

                  {hasGuideContent && (
                    <TabsTrigger
                      id="project-tab-guide"
                      value="guide"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3.5 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Implementation Guide</span>
                    </TabsTrigger>
                  )}

                  {hasRequirementsContent && (
                    <TabsTrigger
                      id="project-tab-requirements"
                      value="requirements"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3.5 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none"
                    >
                      <ListChecks className="h-4 w-4" />
                      <span>Requirements & Tasks</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>

            {/* Tab 1: Overview */}
            {hasOverviewContent && (
              <TabsContent
                value="overview"
                forceMount
                className="m-0 border-none p-0 focus-visible:ring-0 data-[state=inactive]:hidden"
              >
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
                  <ProjectMedia project={project} />
                  <ProjectOverview project={project} />
                  <ProjectMeta project={project} />
                </div>
              </TabsContent>
            )}

            {/* Tab 2: Implementation Guide */}
            {hasGuideContent && (
              <TabsContent
                value="guide"
                forceMount
                className="m-0 border-none p-0 focus-visible:ring-0 data-[state=inactive]:hidden"
              >
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                  <ProjectGuide project={project} />
                </div>
              </TabsContent>
            )}

            {/* Tab 3: Requirements & Tasks */}
            {hasRequirementsContent && (
              <TabsContent
                value="requirements"
                forceMount
                className="m-0 border-none p-0 focus-visible:ring-0 data-[state=inactive]:hidden"
              >
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
                  <ProjectRequirements project={project} />
                  <ProjectChecklist project={project} />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </QueryGuard>
  );
}
