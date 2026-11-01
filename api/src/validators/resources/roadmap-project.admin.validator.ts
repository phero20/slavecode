import { z } from "zod";

export const listAdminProjectsQuerySchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "archived", "updated", "all"])
    .optional()
    .default("all"),
  origin: z
    .enum(["official", "community", "all"])
    .optional()
    .default("all"),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced", "all"])
    .optional()
    .default("all"),
  roadmapSlug: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z
    .enum(["newest", "oldest", "popular", "upvotes", "title"])
    .optional()
    .default("newest"),
});

export const projectContentValidator = z.object({
  overview: z.string().trim().optional().default(""),
  markdown: z.string().trim().optional().default(""),
  previewImage: z.string().url("Must be a valid URL").trim().nullable().optional(),
  requirements: z.array(z.string().trim()).optional().default([]),
  checklist: z.array(z.string().trim()).optional().default([]),
  bonusChallenges: z.array(z.string().trim()).optional().default([]),
  suggestedTechStack: z.array(z.string().trim()).optional().default([]),
});

export const createAdminProjectSchema = z.object({
  slug: z.string().trim().optional(),
  title: z.string().min(2, "Title must be at least 2 characters").max(200).trim(),
  description: z.string().min(5, "Description must be at least 5 characters").max(3000).trim(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  roadmapIds: z
    .array(z.string().min(1).trim())
    .min(1, "At least one roadmap is required"),
  topics: z.array(z.string().trim()).optional().default([]),
  skills: z.array(z.string().trim()).optional().default([]),
  type: z.string().trim().optional().default("code"),
  content: projectContentValidator.optional(),
  origin: z.enum(["official", "community"]).optional().default("official"),
  status: z
    .enum(["pending", "approved", "rejected", "archived", "updated"])
    .optional()
    .default("approved"),
  adminNotes: z.string().max(1000).trim().optional(),
});

export const updateAdminProjectSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  description: z.string().min(5).max(3000).trim().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  roadmapIds: z.array(z.string().min(1).trim()).optional(),
  topics: z.array(z.string().trim()).optional(),
  skills: z.array(z.string().trim()).optional(),
  type: z.string().trim().optional(),
  content: projectContentValidator.partial().optional(),
  origin: z.enum(["official", "community"]).optional(),
  status: z
    .enum(["pending", "approved", "rejected", "archived", "updated"])
    .optional(),
  rejectionReason: z.string().max(1000).trim().nullable().optional(),
  adminNotes: z.string().max(1000).trim().nullable().optional(),
});

export const moderateProjectSchema = z.object({
  status: z.enum(["approved", "rejected", "archived", "pending", "updated"]),
  rejectionReason: z.string().max(1000).trim().optional(),
  adminNotes: z.string().max(1000).trim().optional(),
});

export const projectSlugOrIdParamSchema = z.object({
  slugOrId: z.string().min(1, "Project identifier is required").trim(),
});
