"use client";

import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";
import { CategorySkeletonList } from "./CategorySkeletons";
import { Card } from "@/components/ui/card";

// Re-export project skeletons for backward compatibility
export {
  ProjectsPageSkeleton,
  RoadmapProjectsSkeleton,
  ProjectCardSkeleton,
  ProjectsGridSkeleton,
} from "./ProjectsSkeletons";

/**
 * Resources Page Overview Skeleton
 * Matches ResourcesClient.tsx and resources-sidebar.tsx 1:1 with zero layout shift.
 */
export function ResourcesPageSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)]">
        <div className="flex w-full flex-col lg:flex-row">
          {/* Mobile Slide-out Header Skeleton */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border/40 p-4 pt-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton width={110} height={18} className="rounded-sm opacity-40" />
            </div>
            <Skeleton width={80} height={32} className="rounded-md opacity-30" />
          </div>

          {/* Desktop Sticky Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-border/40 bg-card/30">
            <div className="sticky top-20 overflow-hidden flex flex-col h-[calc(100vh-5rem)]">
              {/* Header */}
              <div className="px-3 pb-1 border-b border-border/40 flex items-center justify-between gap-2">
                <Skeleton width={80} height={18} className="rounded-sm opacity-40" />
              </div>

              {/* Category Search Bar */}
              <div className="p-2 border-b border-border/40">
                <Skeleton width="100%" height={32} className="rounded-lg opacity-25" />
              </div>

              {/* Scrollable Category List */}
              <div className="flex-1 overflow-y-auto">
                <CategorySkeletonList count={12} />
              </div>
            </div>
          </aside>

          {/* Content Area with Independent Scroll */}
          <main className="flex-1 min-w-0">
            <div className="px-4 sm:px-8 lg:px-12 pt-40 lg:pt-20 pb-16 max-h-screen overflow-y-auto mx-auto relative space-y-8">
              {/* Top Row: Category Title on Left, Search Bar on Right */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="space-y-2">
                  <Skeleton width={220} height={32} className="rounded-md opacity-40" />
                  <Skeleton width={320} height={14} className="rounded-sm opacity-25" />
                </div>

                {/* Search Bar on Right Side */}
                <div className="relative w-full sm:w-72 md:w-80 shrink-0">
                  <Skeleton width="100%" height={40} className="rounded-md opacity-30" />
                </div>
              </div>

              {/* Sections & Section Pills Grid */}
              <div className="space-y-10 pb-16">
                {/* Section 1: Role-based */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <Skeleton width={160} height={14} className="rounded-sm opacity-30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3.5 py-3 shadow-xs"
                      >
                        <Skeleton
                          width={120 + ((i * 23) % 70)}
                          height={16}
                          className="rounded-sm opacity-35"
                        />
                        <Skeleton width={14} height={14} className="rounded-sm opacity-20" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 2: Skill-based */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <Skeleton width={140} height={14} className="rounded-sm opacity-30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3.5 py-3 shadow-xs"
                      >
                        <Skeleton
                          width={100 + ((i * 19) % 80)}
                          height={16}
                          className="rounded-sm opacity-35"
                        />
                        <Skeleton width={14} height={14} className="rounded-sm opacity-20" />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SkeletonProvider>
  );
}

/**
 * Roadmap Detail Page Skeleton
 * Matches RoadmapDetailClient.tsx and roadmap-detail-header.tsx 1:1.
 */
export function RoadmapDetailSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="flex flex-col min-h-screen bg-background py-24">
        {/* Top Header & Tabs Row */}
        <div className="w-full bg-background relative z-10 border-b">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {/* Header Ghost */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 py-6">
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton width={220} height={42} className="rounded-md opacity-40" />
                <Skeleton width={60} height={22} className="rounded-full opacity-25" />
              </div>
              <div className="flex-1 max-w-3xl border-l-[3px] border-border/70 pl-5 py-0.5">
                <Skeleton width="90%" height={16} className="rounded-sm opacity-30" />
                <Skeleton width="60%" height={16} className="rounded-sm opacity-20 mt-1.5" />
              </div>
              <div className="shrink-0">
                <Skeleton width={85} height={36} className="rounded-md opacity-25" />
              </div>
            </div>

            {/* Tabs Ghost */}
            <div className="flex items-center gap-8 py-4">
              <Skeleton width={60} height={20} className="rounded-sm opacity-30" />
              <Skeleton width={90} height={20} className="rounded-sm opacity-30" />
              <Skeleton width={85} height={20} className="rounded-sm opacity-30" />
              <Skeleton width={80} height={20} className="rounded-sm opacity-30" />
            </div>
          </div>
        </div>

        {/* Content Area Ghost */}
        <main className="container mx-auto px-4 md:px-6 max-w-7xl mt-12 mb-24 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Skeleton width={56} height={56} className="rounded-2xl opacity-25" />
            <Skeleton width={260} height={28} className="rounded-xl opacity-30" />
            <Skeleton width={380} height={16} className="rounded opacity-20 max-w-sm" />
          </div>
        </main>
      </div>
    </SkeletonProvider>
  );
}

/**
 * Roadmap Topic Detail Skeleton (displayed when a topic node is clicked)
 * Matches RoadmapTopicView.tsx 1:1.
 */
export function RoadmapTopicSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
        {/* Topic Header Ghost */}
        <div className="space-y-2 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Skeleton width={260} height={32} className="rounded-md opacity-40" />
            <Skeleton width={70} height={22} className="rounded-full opacity-25" />
          </div>
        </div>

        {/* Markdown Content Ghost */}
        <div className="space-y-3 py-2">
          <Skeleton width="100%" height={16} className="rounded-sm opacity-35" />
          <Skeleton width="92%" height={16} className="rounded-sm opacity-30" />
          <Skeleton width="78%" height={16} className="rounded-sm opacity-25" />
          <Skeleton width="85%" height={16} className="rounded-sm opacity-25" />
        </div>

        {/* Resources Ghost */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center gap-6 border-b border-border/40 pb-3">
            <Skeleton width={50} height={20} className="rounded opacity-35" />
            <Skeleton width={70} height={20} className="rounded opacity-25" />
            <Skeleton width={65} height={20} className="rounded opacity-25" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/60 bg-card/40 p-4 flex items-center gap-3"
              >
                <Skeleton width={32} height={32} className="rounded-md opacity-30 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton width="80%" height={16} className="rounded opacity-35" />
                  <Skeleton width="40%" height={12} className="rounded opacity-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonProvider>
  );
}

/**
 * Single Resource Card Skeleton
 * Matches RoadmapResourceCard.tsx 1:1.
 */
export function ResourceCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden h-full bg-card border-2 border-border/40 shadow-sm">
      <div className="p-2 sm:p-2.5 pb-0">
        <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-border/40 bg-muted/20 shrink-0 flex items-center justify-center">
          <Skeleton width="100%" height="100%" className="rounded-lg opacity-25" />
        </div>
      </div>
      <div className="p-4 sm:p-5 pt-3.5 sm:pt-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton width={90} height={20} className="rounded-full opacity-35" />
            <Skeleton width={14} height={14} className="rounded-sm opacity-25" />
          </div>
          <div className="space-y-1.5">
            <Skeleton width="75%" height={20} className="rounded-sm opacity-40" />
            <div className="space-y-1">
              <Skeleton width="100%" height={13} className="rounded-sm opacity-25" />
              <Skeleton width="60%" height={13} className="rounded-sm opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Resources Grid Skeleton
 * Matches RoadmapResourcesView.tsx 1:1.
 */
export function RoadmapResourcesSkeleton({ count = 9 }: { count?: number }) {
  return (
    <SkeletonProvider noWrapper>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1 pb-16">
        {Array.from({ length: count }).map((_, i) => (
          <ResourceCardSkeleton key={i} />
        ))}
      </div>
    </SkeletonProvider>
  );
}

export default ResourcesPageSkeleton;
