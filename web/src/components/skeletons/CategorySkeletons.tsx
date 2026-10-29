"use client";

import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

export interface CategorySkeletonListProps {
  count?: number;
}

/**
 * High-fidelity Category Skeleton List
 * Matches CategoryItemsList in CategorySidebar 1:1 with zero layout shift.
 */
export function CategorySkeletonList({ count = 12 }: CategorySkeletonListProps) {
  return (
    <SkeletonProvider noWrapper>
      <div className="flex flex-col gap-1 p-2 py-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={`cat-skel-${i}`}
            className="flex items-center justify-between w-full py-2 px-3 rounded-md"
          >
            <Skeleton
              width={i === 0 ? 95 : 100 + ((i * 17) % 50)}
              height={14}
              className="rounded-sm opacity-35"
            />
            <Skeleton width={20} height={14} className="rounded-sm opacity-20" />
          </div>
        ))}
      </div>
    </SkeletonProvider>
  );
}

/**
 * Standalone Category Sidebar Skeleton (Desktop)
 */
export function CategorySidebarSkeleton({ count = 16 }: { count?: number }) {
  return (
    <SkeletonProvider noWrapper>
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-border/40 bg-card/30">
        <div className="sticky top-20 overflow-hidden flex flex-col h-[calc(100vh-5rem)]">
          {/* Header */}
          <div className="px-3 pb-1 border-b border-border/40 flex items-center justify-between gap-2">
            <Skeleton width={80} height={18} className="rounded-sm opacity-40" />
          </div>

          {/* Search Bar */}
          <div className="p-2 border-b border-border/40">
            <Skeleton width="100%" height={32} className="rounded-lg opacity-25" />
          </div>

          {/* Category List */}
          <div className="flex-1 overflow-y-auto">
            <CategorySkeletonList count={count} />
          </div>
        </div>
      </aside>
    </SkeletonProvider>
  );
}

export default CategorySkeletonList;
