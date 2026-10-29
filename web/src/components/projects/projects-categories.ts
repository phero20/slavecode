import type { ProjectCategory } from "@/types/project";

/**
 * Re-export the shared ProjectCategory interface from @/types/project
 * Categories and counts are fetched dynamically from MongoDB via useProjectCategoriesQuery.
 */
export type ProjectCategoryItem = ProjectCategory;

