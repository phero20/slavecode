import { z } from "zod";

export const listAdminResourcesQuerySchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "archived", "all"])
    .optional()
    .default("all"),
  origin: z
    .enum(["official", "community", "all"])
    .optional()
    .default("all"),
  roadmapSlug: z.string().trim().optional(),
  type: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z
    .enum(["newest", "oldest", "popular", "upvotes"])
    .optional()
    .default("newest"),
});

export const createAdminResourceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(300).trim(),
  description: z.string().max(2000).trim().optional().default(""),
  url: z.string().url("Must be a valid URL").trim(),
  thumbnailUrl: z.string().url("Must be a valid URL").trim().nullable().optional(),
  type: z.string().min(1, "Type is required").max(100).trim(),
  author: z.string().max(200).trim().optional().default(""),
  roadmapIds: z
    .array(z.string().min(1).trim())
    .min(1, "At least one roadmap is required"),
  order: z.number().int().min(0).optional().default(0),
  origin: z.enum(["official", "community"]).optional().default("official"),
  status: z
    .enum(["pending", "approved", "rejected", "archived"])
    .optional()
    .default("approved"),
  adminNotes: z.string().max(1000).trim().optional(),
});

export const updateAdminResourceSchema = z.object({
  title: z.string().min(2).max(300).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  url: z.string().url().trim().optional(),
  thumbnailUrl: z.string().url().trim().nullable().optional(),
  type: z.string().min(1).max(100).trim().optional(),
  author: z.string().max(200).trim().optional(),
  roadmapIds: z.array(z.string().min(1).trim()).optional(),
  order: z.number().int().min(0).optional(),
  origin: z.enum(["official", "community"]).optional(),
  status: z.enum(["pending", "approved", "rejected", "archived"]).optional(),
  rejectionReason: z.string().max(1000).trim().nullable().optional(),
  adminNotes: z.string().max(1000).trim().nullable().optional(),
});

export const moderateResourceSchema = z.object({
  status: z.enum(["approved", "rejected", "archived", "pending"]),
  rejectionReason: z.string().max(1000).trim().optional(),
  adminNotes: z.string().max(1000).trim().optional(),
});

export const resourceIdParamSchema = z.object({
  id: z.string().min(1, "Resource ID is required").trim(),
});

