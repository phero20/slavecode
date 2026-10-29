"use client";

import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";
import { Card } from "@/components/ui/card";
import { CategorySkeletonList } from "./CategorySkeletons";

/**
 * Single Project Card Skeleton
 * Matches project-card.tsx 1:1 with top aspect-video preview image container and metadata.
 */
export function ProjectCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden h-full bg-card border-2 border-border/40 shadow-sm">
      {/* Top Preview Image Container with Inset Padding matching ProjectCard */}
      <div className="p-2 sm:p-2.5 pb-0">
        <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-border/40 bg-muted/20 shrink-0 flex items-center justify-center">
          <Skeleton width="100%" height="100%" className="rounded-lg opacity-25" />
        </div>
      </div>

      {/* Content Area Below Image */}
      <div className="p-4 sm:p-5 pt-3.5 sm:pt-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Difficulty Badge + Category Pill */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton width={75} height={20} className="rounded-full opacity-35" />
            <Skeleton width={60} height={18} className="rounded-md opacity-25" />
          </div>

          {/* Project Title & Description */}
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
 * Projects Grid Skeleton
 * Matches projects-grid.tsx and RoadmapProjectsView.tsx 1:1.
 */
export function RoadmapProjectsSkeleton({ count = 9 }: { count?: number }) {
  return (
    <SkeletonProvider noWrapper>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1 pb-16">
        {Array.from({ length: count }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </SkeletonProvider>
  );
}

export const ProjectsGridSkeleton = RoadmapProjectsSkeleton;

/**
 * Full Projects Page Overview Skeleton
 * Matches ProjectsClient.tsx layout with sticky category sidebar, header, difficulty tabs, and 3x3 project grid.
 */
export function ProjectsPageSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)]">
        <div className="flex w-full flex-col lg:flex-row">
          {/* Mobile Slide-out Header Skeleton */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border/40 bg-background p-4 pt-20">
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
                <CategorySkeletonList count={16} />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="px-4 sm:px-8 lg:px-12 pt-40 lg:pt-20 pb-16 max-h-screen overflow-y-auto mx-auto relative space-y-6">
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

              {/* Difficulty Tabs Skeleton */}
              <div className="flex items-center gap-6 border-b border-border/60 pb-2">
                <Skeleton width={60} height={20} className="rounded-sm opacity-40" />
                <Skeleton width={80} height={20} className="rounded-sm opacity-30" />
                <Skeleton width={90} height={20} className="rounded-sm opacity-30" />
                <Skeleton width={80} height={20} className="rounded-sm opacity-30" />
              </div>

              {/* Project Cards 3x3 Grid */}
              <RoadmapProjectsSkeleton count={9} />
            </div>
          </main>
        </div>
      </div>
    </SkeletonProvider>
  );
}

/**
 * Full Project Detail Page Skeleton
 * Matches ProjectDetailView.tsx 1:1 with single-column layout on plain background.
 */
export function ProjectDetailSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-12 space-y-10 animate-in fade-in-50 duration-200">
        {/* Header Section */}
        <div className="space-y-5">
          {/* Back Link */}
          <div>
            <Skeleton width={130} height={18} className="rounded opacity-30" />
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-2">
            <Skeleton width={80} height={22} className="rounded-full opacity-35" />
            <Skeleton width={60} height={20} className="rounded-md opacity-25" />
            <Skeleton width={70} height={20} className="rounded-md opacity-25" />
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <Skeleton width="65%" height={36} className="rounded-md opacity-40" />
            <div className="space-y-1.5">
              <Skeleton width="95%" height={18} className="rounded-sm opacity-25" />
              <Skeleton width="75%" height={18} className="rounded-sm opacity-20" />
            </div>
          </div>

          {/* Tabs Navigation Skeleton */}
          <div className="flex items-center gap-6 sm:gap-8 pt-4 border-b border-border/40">
            <Skeleton width={70} height={28} className="rounded opacity-40" />
            <Skeleton width={70} height={28} className="rounded opacity-25" />
            <Skeleton width={120} height={28} className="rounded opacity-25" />
          </div>
        </div>

        {/* Media Preview Aspect Video */}
        <div className="w-full aspect-video rounded-xl border border-border/40 overflow-hidden bg-muted/20 flex items-center justify-center">
          <Skeleton width="100%" height="100%" className="opacity-25" />
        </div>

        {/* Overview Section */}
        <div className="space-y-3">
          <Skeleton width={110} height={24} className="rounded-md opacity-40" />
          <div className="space-y-2">
            <Skeleton width="100%" height={16} className="rounded-sm opacity-25" />
            <Skeleton width="96%" height={16} className="rounded-sm opacity-25" />
            <Skeleton width="80%" height={16} className="rounded-sm opacity-25" />
          </div>
        </div>

        {/* Requirements Section */}
        <div className="space-y-4">
          <Skeleton width={140} height={24} className="rounded-md opacity-40" />
          <div className="space-y-3 pl-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Skeleton width={idx % 2 === 0 ? "85%" : "70%"} height={16} className="rounded-sm opacity-25" />
              </div>
            ))}
          </div>
        </div>

        {/* Meta Section */}
        <div className="space-y-6 pt-6 border-t border-border/40">
          <div className="space-y-2.5">
            <Skeleton width={130} height={14} className="rounded opacity-35" />
            <div className="flex gap-2">
              <Skeleton width={80} height={32} className="rounded-lg opacity-30" />
              <Skeleton width={90} height={32} className="rounded-lg opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonProvider>
  );
}

export default ProjectsPageSkeleton;
