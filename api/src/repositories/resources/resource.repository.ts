import type { ICradle } from "../../libs/awilix-container";
import { RoadmapModel } from "../../mongo/models/roadmap.model";
import { RoadmapCategoryModel } from "../../mongo/models/roadmap-category.model";

import {
  type RoadmapTitle,
  type RoadmapSummary,
  type RoadmapDetail,
  type ResourceCategoryMeta,
  type RoadmapCategoryItem,
  type RoadmapSection,
  type RoadmapCategory,
  type IResourceRepository,
} from "../../types/resources";

// Re-export types for backward compatibility
export type {
  RoadmapTitle,
  RoadmapSummary,
  RoadmapDetail,
  ResourceCategoryMeta,
  RoadmapCategoryItem,
  RoadmapSection,
  RoadmapCategory,
  IResourceRepository,
};


export class ResourceRepository implements IResourceRepository {
  constructor(_?: ICradle) {}

  async getAllRoadmaps(category?: string): Promise<RoadmapSummary[]> {
    const filter: any = {};
    if (category && category !== "all") {
      filter.categories = category.toLowerCase().trim();
    }

    const docs: any[] = await RoadmapModel.find(filter, {
      _id: 1,
      slug: 1,
      title: 1,
      description: 1,
      categories: 1,
      type: 1,
      status: 1,
      nodesCount: 1,
    })
      .sort({ "title.card": 1 })
      .lean();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      slug: doc.slug,
      title: doc.title,
      description: doc.description || "",
      category: doc.categories?.[0] || "other",
      categories: doc.categories || [],
      type: doc.type || "skill",
      status: doc.status,
      nodesCount: doc.nodesCount || 0,
    }));
  }

  async getRoadmapBySlug(slug: string): Promise<RoadmapDetail | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const doc: any = await RoadmapModel.findOne({ slug: cleanSlug }).lean();
    if (!doc) return null;

    return {
      _id: doc._id.toString(),
      title: doc.title,
      description: doc.description || "",
      slug: doc.slug,
      category: doc.categories?.[0] || "other",
      categories: doc.categories || [],
      type: doc.type || "skill",
      status: doc.status,
      nodes: doc.nodes || [],
      edges: doc.edges || [],
      dimensions: doc.dimensions,
      relatedRoadmaps: doc.relatedRoadmaps || [],
      seo: doc.seo,
    };
  }

  async getCategories(): Promise<RoadmapCategory[]> {
    const docs: any[] = await RoadmapCategoryModel.find()
      .sort({ order: 1 })
      .lean();

    return docs.map((doc) => ({
      id: doc.categoryId,
      title: doc.title,
      count: doc.count,
      sections: doc.sections || [],
    }));
  }

  async searchRoadmaps(query: string): Promise<RoadmapSummary[]> {
    const q = query.toLowerCase().trim();
    if (!q) return await this.getAllRoadmaps();

    const docs: any[] = await RoadmapModel.find(
      {
        $or: [
          { "title.card": { $regex: q, $options: "i" } },
          { "title.page": { $regex: q, $options: "i" } },
          { slug: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { categories: { $regex: q, $options: "i" } },
        ],
      },
      {
        _id: 1,
        slug: 1,
        title: 1,
        description: 1,
        categories: 1,
        type: 1,
        status: 1,
        nodesCount: 1,
      }
    )
      .sort({ "title.card": 1 })
      .lean();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      slug: doc.slug,
      title: doc.title,
      description: doc.description || "",
      category: doc.categories?.[0] || "other",
      categories: doc.categories || [],
      type: doc.type || "skill",
      status: doc.status,
      nodesCount: doc.nodesCount || 0,
    }));
  }
}
