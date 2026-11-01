import { z } from "zod";

export const roadmapItemRefSchema = z.object({
  slug: z.string().min(1, "Roadmap slug is required"),
  title: z.string().min(1, "Roadmap title is required"),
});

export const roadmapCategorySectionSchema = z.object({
  heading: z.string().min(1, "Section heading is required"),
  roadmaps: z.array(roadmapItemRefSchema).default([]),
});

export const createRoadmapCategorySchema = z.object({
  categoryId: z
    .string()
    .min(1, "Category ID is required")
    .regex(
      /^[a-z0-9_-]+$/,
      "Category ID can only contain lowercase letters, numbers, hyphens, and underscores"
    ),
  title: z.string().min(1, "Title is required"),
  order: z.number().int().default(0),
  sections: z.array(roadmapCategorySectionSchema).default([]),
});

export const updateRoadmapCategorySchema = createRoadmapCategorySchema
  .partial()
  .omit({ categoryId: true });

export const roadmapTitleSchema = z.object({
  card: z.string().min(1, "Card title is required"),
  page: z.string().min(1, "Page title is required"),
});

export const roadmapDimensionsSchema = z.object({
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export const createRoadmapSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  title: roadmapTitleSchema,
  description: z.string().default(""),
  type: z.enum(["role", "skill"]).default("skill"),
  categories: z.array(z.string()).default([]),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
  dimensions: roadmapDimensionsSchema.optional(),
  relatedRoadmaps: z.array(z.string()).default([]),
  seo: z.record(z.string(), z.any()).optional(),
  status: z.enum(["published", "draft", "archived"]).default("published"),
});

export const updateRoadmapSchema = createRoadmapSchema
  .partial()
  .omit({ slug: true });

export const updateRoadmapStatusSchema = z.object({
  status: z.enum(["published", "draft", "archived"]),
});

export const RoadmapSlugParamSchema = z.object({
  slug: z.string().min(1, "Roadmap slug is required"),
});

export const CategoryIdParamSchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});
