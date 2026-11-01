import { z } from "zod";
import type { Roadmap } from "../../mongo/models/roadmap.model";
import type { RoadmapCategory } from "../../mongo/models/roadmap-category.model";
import {
  createRoadmapCategorySchema,
  updateRoadmapCategorySchema,
  createRoadmapSchema,
  updateRoadmapSchema,
  updateRoadmapStatusSchema,
} from "../../validators/resources/resource.admin.validator";

export type CreateRoadmapCategoryPayload = z.infer<
  typeof createRoadmapCategorySchema
>;
export type UpdateRoadmapCategoryPayload = z.infer<
  typeof updateRoadmapCategorySchema
>;
export type CreateRoadmapPayload = z.infer<typeof createRoadmapSchema>;
export type UpdateRoadmapPayload = z.infer<typeof updateRoadmapSchema>;
export type UpdateRoadmapStatusPayload = z.infer<
  typeof updateRoadmapStatusSchema
>;

export interface RoadmapAdminListFilter {
  category?: string;
  status?: string;
  search?: string;
  type?: "role" | "skill";
}

export interface ResourceAdminStats {
  roadmaps: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  categories: number;
  totalNodes: number;
}

export interface IResourceAdminRepository {
  // Stats
  getStats(): Promise<ResourceAdminStats>;

  // Category operations
  getAllCategories(): Promise<RoadmapCategory[]>;
  getCategoryById(id: string): Promise<RoadmapCategory | null>;
  getCategoryByCategoryId(categoryId: string): Promise<RoadmapCategory | null>;
  createCategory(
    payload: CreateRoadmapCategoryPayload
  ): Promise<RoadmapCategory>;
  updateCategory(
    id: string,
    payload: UpdateRoadmapCategoryPayload
  ): Promise<RoadmapCategory | null>;
  deleteCategory(id: string): Promise<boolean>;

  // Roadmap operations
  getAllRoadmaps(filter?: RoadmapAdminListFilter): Promise<Roadmap[]>;
  getRoadmapBySlug(slug: string): Promise<Roadmap | null>;
  getRoadmapById(id: string): Promise<Roadmap | null>;
  createRoadmap(payload: CreateRoadmapPayload): Promise<Roadmap>;
  updateRoadmap(
    slug: string,
    payload: UpdateRoadmapPayload
  ): Promise<Roadmap | null>;
  updateRoadmapStatus(
    slug: string,
    status: string
  ): Promise<Roadmap | null>;
  deleteRoadmap(slug: string): Promise<boolean>;
  getRoadmapsCountByCategory(categoryId: string): Promise<number>;
  syncCategoryCounts(): Promise<void>;
}

export interface IResourceAdminService {
  // Stats
  getStats(): Promise<ResourceAdminStats>;

  // Category
  getAllCategories(): Promise<RoadmapCategory[]>;
  getCategoryById(id: string): Promise<RoadmapCategory>;
  createCategory(
    payload: CreateRoadmapCategoryPayload
  ): Promise<RoadmapCategory>;
  updateCategory(
    id: string,
    payload: UpdateRoadmapCategoryPayload
  ): Promise<RoadmapCategory>;
  deleteCategory(id: string): Promise<void>;

  // Roadmap
  getAllRoadmaps(filter?: RoadmapAdminListFilter): Promise<Roadmap[]>;
  getRoadmapBySlug(slug: string): Promise<Roadmap>;
  createRoadmap(payload: CreateRoadmapPayload): Promise<Roadmap>;
  updateRoadmap(slug: string, payload: UpdateRoadmapPayload): Promise<Roadmap>;
  updateRoadmapStatus(
    slug: string,
    payload: UpdateRoadmapStatusPayload
  ): Promise<Roadmap>;
  deleteRoadmap(slug: string): Promise<void>;
  syncCategoryCounts(): Promise<void>;
}
