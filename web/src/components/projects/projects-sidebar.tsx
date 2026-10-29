"use client";

import React from "react";
import type { ProjectCategory } from "@/types/project";
import { useProjectCategoriesQuery } from "@/hooks/queries/use-project.queries";
import { useProjectsStore } from "@/store/use-projects-store";
import {
  CategoryDesktopSidebar,
  CategoryMobileHeader,
  CategorySkeletonList,
  CategoryItemsList,
  type CategorySidebarProps,
} from "@/components/shared/CategorySidebar";

export type ProjectsSidebarProps = CategorySidebarProps<ProjectCategory>;
export const ProjectCategorySkeletonList = CategorySkeletonList;
export const ProjectCategoryItemsList = CategoryItemsList;

/**
 * Desktop Sticky Projects Sidebar
 */
export function ProjectsDesktopSidebar({
  categories: propCategories,
  selectedCategory: propSelectedCategory,
  onSelectCategory: propOnSelectCategory,
  isLoading: propIsLoading,
  error: propError,
  onRetry: propOnRetry,
}: Omit<ProjectsSidebarProps, "isMobile">) {
  const {
    data: queryCategories,
    isLoading: queryLoading,
    error: queryError,
    refetch: queryRefetch,
  } = useProjectCategoriesQuery();
  const storeCategory = useProjectsStore((s) => s.selectedCategory);
  const setStoreCategory = useProjectsStore((s) => s.setSelectedCategory);

  const categories = propCategories ?? queryCategories ?? [];
  const selectedCategory = propSelectedCategory ?? storeCategory;
  const onSelectCategory = propOnSelectCategory ?? setStoreCategory;
  const isLoading = propIsLoading ?? (queryLoading && !propCategories);
  const error = propError ?? (queryError && !propCategories ? queryError : null);
  const onRetry = propOnRetry ?? queryRefetch;

  return (
    <CategoryDesktopSidebar
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      title="Categories"
      allLabel="All Projects"
      searchPlaceholder="Search categories..."
      idPrefix="project"
    />
  );
}

/**
 * Mobile Projects Header & Drawer
 */
export function ProjectsMobileHeader({
  categories: propCategories,
  selectedCategory: propSelectedCategory,
  onSelectCategory: propOnSelectCategory,
  isLoading: propIsLoading,
  error: propError,
  onRetry: propOnRetry,
}: Omit<ProjectsSidebarProps, "isMobile">) {
  const {
    data: queryCategories,
    isLoading: queryLoading,
    error: queryError,
    refetch: queryRefetch,
  } = useProjectCategoriesQuery();
  const storeCategory = useProjectsStore((s) => s.selectedCategory);
  const setStoreCategory = useProjectsStore((s) => s.setSelectedCategory);

  const categories = propCategories ?? queryCategories ?? [];
  const selectedCategory = propSelectedCategory ?? storeCategory;
  const onSelectCategory = propOnSelectCategory ?? setStoreCategory;
  const isLoading = propIsLoading ?? (queryLoading && !propCategories);
  const error = propError ?? (queryError && !propCategories ? queryError : null);
  const onRetry = propOnRetry ?? queryRefetch;

  return (
    <CategoryMobileHeader
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      title="Categories"
      allLabel="All Projects"
      searchPlaceholder="Search categories..."
      idPrefix="project"
    />
  );
}
