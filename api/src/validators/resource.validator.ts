import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  roadmapIds: z
    .array(z.string().min(1))
    .min(1, "Please select at least one roadmap category"),
  topics: z.array(z.string().min(1)).optional(),
  skills: z.array(z.string().min(1)).optional(),
  content: z
    .object({
      overview: z.string().optional(),
      markdown: z.string().optional(),
      previewImage: z
        .string()
        .url("Must be a valid URL")
        .nullable()
        .optional()
        .or(z.literal("")),
      requirements: z.array(z.string()).optional(),
      checklist: z.array(z.string()).optional(),
      bonusChallenges: z.array(z.string()).optional(),
      suggestedTechStack: z.array(z.string()).optional(),
    })
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

