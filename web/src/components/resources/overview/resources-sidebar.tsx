"use client";

import React from "react";
import type { RoadmapCategory } from "@/types/resource";
import {
  CategoryDesktopSidebar,
  CategoryMobileHeader,
  CategorySkeletonList,
  CategoryItemsList,
  type CategorySidebarProps,
} from "@/components/shared/CategorySidebar";

export type ResourcesSidebarProps = CategorySidebarProps<RoadmapCategory>;
export { CategorySkeletonList, CategoryItemsList };

/**
 * Desktop Sticky Resources Sidebar
 */
export function ResourcesDesktopSidebar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  isLoading,
  error,
  onRetry,
}: Omit<ResourcesSidebarProps, "isMobile">) {
  return (
    <CategoryDesktopSidebar
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      title="Categories"
      allLabel="All Roadmaps"
      searchPlaceholder="Search categories..."
      idPrefix="resource"
    />
  );
}

/**
 * Mobile Resources Header & Drawer
 */
export function ResourcesMobileHeader({
  categories = [],
  selectedCategory,
  onSelectCategory,
  isLoading,
  error,
  onRetry,
}: Omit<ResourcesSidebarProps, "isMobile">) {
  return (
    <CategoryMobileHeader
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      title="Categories"
      allLabel="All Roadmaps"
      searchPlaceholder="Search categories..."
      idPrefix="resource"
    />
  );
}
