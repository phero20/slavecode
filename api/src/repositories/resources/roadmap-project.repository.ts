import { MongoBaseRepository } from "../base.repository";
import {
  RoadmapProjectModel,
  type RoadmapProject,
  type RoadmapProjectDocument,
  type ProjectDifficulty,
} from "../../mongo/models/roadmap-project.model";
import { RoadmapModel } from "../../mongo/models/roadmap.model";
import type { ICradle } from "../../libs/awilix-container";

import {
  type ProjectCategorySummary,
  type GetProjectsFilter,
  type IRoadmapProjectRepository,
  type ProjectSortOption,
} from "../../types/resources";

// Re-export types for backward compatibility
export type {
  ProjectCategorySummary,
  GetProjectsFilter,
  IRoadmapProjectRepository,
};

export class RoadmapProjectRepository
  extends MongoBaseRepository<RoadmapProject, RoadmapProjectDocument>
  implements IRoadmapProjectRepository
{
  constructor(_?: ICradle) {
    super(RoadmapProjectModel);
  }

  /**
   * Fetch approved projects associated with a given roadmap slug.
   */
  async getProjectsByRoadmap(
    roadmapSlug: string,
    difficulty?: ProjectDifficulty,
    sort?: ProjectSortOption,
  ): Promise<RoadmapProject[]> {
    const cleanSlug = roadmapSlug.toLowerCase().trim();

    const query: any = {
      status: "approved",
      roadmapIds: cleanSlug,
    };

    if (difficulty) {
      query.difficulty = difficulty.toLowerCase().trim();
    }

    const sortOrder =
      sort === "newest"
        ? { createdAt: -1, _id: -1 }
        : { "stats.upvotesCount": -1, order: 1, _id: 1 };

    const docs = await this.model
      .find(query)
      .sort(sortOrder as any)
      .lean()
      .exec();

    return this.toDomainArray(docs as any);
  }

  /**
   * Fetch a single approved project by its unique slug
   */
  async getProjectBySlug(slug: string): Promise<RoadmapProject | null> {
    const cleanSlug = slug.toLowerCase().trim();

    const doc = await this.model
      .findOne({
        slug: cleanSlug,
        status: { $ne: "archived" },
      })
      .lean()
      .exec();

    if (!doc) return null;
    return this.toDomain(doc as any);
  }

  /**
   * General exploration / catalog fetch with filtering and pagination
   */
  async getAllProjects(filter?: GetProjectsFilter): Promise<{
    projects: RoadmapProject[];
    total: number;
  }> {
    const query: any = {
      status: "approved",
    };

    if (filter?.roadmapSlug) {
      query.roadmapIds = filter.roadmapSlug.toLowerCase().trim();
    }

    if (filter?.difficulty) {
      query.difficulty = filter.difficulty.toLowerCase().trim();
    }

    if (filter?.topic) {
      query.topics = filter.topic.toLowerCase().trim();
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { topics: searchRegex },
        { skills: searchRegex },
      ];
    }

    const skip = Math.max(0, filter?.skip ?? 0);
    const limit = Math.min(100, Math.max(1, filter?.limit ?? 50));

    const sort =
      filter?.sort === "newest"
        ? { createdAt: -1, _id: -1 }
        : { "stats.upvotesCount": -1, order: 1, _id: 1 };

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return {
      projects: this.toDomainArray(docs as any),
      total,
    };
  }

  /**
   * Fetch top projects by learner engagement
   */
  async getPopularProjects(limit = 10): Promise<RoadmapProject[]> {
    const safeLimit = Math.min(50, Math.max(1, limit));

    const docs = await this.model
      .find({ status: "approved" })
      .sort({ "stats.startedCount": -1, "stats.upvotesCount": -1, order: 1 })
      .limit(safeLimit)
      .lean()
      .exec();

    return this.toDomainArray(docs as any);
  }

  /**
   * Fetch all roadmap project categories with live counts.
   * Dynamically aggregates approved project counts per roadmapId,
   * pulls all roadmaps from MongoDB with their official titles,
   * and sorts descending by count with "All Projects" pinned at the top.
   */
  async getProjectCategories(): Promise<ProjectCategorySummary[]> {
    // 1. Total approved projects count
    const totalApproved = await this.model.countDocuments({
      status: "approved",
    });

    // 2. Count approved projects per roadmapId via MongoDB aggregation
    const projectCounts: Array<{ _id: string; count: number }> =
      await this.model.aggregate([
        { $match: { status: "approved" } },
        { $unwind: "$roadmapIds" },
        { $group: { _id: "$roadmapIds", count: { $sum: 1 } } },
      ]);

    const countMap = new Map<string, number>();
    for (const item of projectCounts) {
      if (item._id) {
        countMap.set(item._id.toLowerCase().trim(), item.count);
      }
    }

    // 3. Fetch all roadmaps from MongoDB to get their official titles
    const allRoadmaps = await RoadmapModel.find(
      {},
      { slug: 1, title: 1 },
    ).lean();

    // 4. Map every roadmap to its category summary
    const categories: ProjectCategorySummary[] = allRoadmaps.map((r: any) => {
      const slug = r.slug.toLowerCase().trim();
      const title =
        typeof r.title === "object"
          ? r.title?.card || r.title?.page || slug
          : r.title || slug;
      const count = countMap.get(slug) || 0;

      return {
        id: slug,
        title,
        count,
      };
    });

    // 5. Sort: highest project count first; if tied, alphabetical by title
    categories.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.title.localeCompare(b.title);
    });

    // 6. Return with "All Projects" pinned at the top
    return [
      { id: "all", title: "All Projects", count: totalApproved },
      ...categories,
    ];
  }

  /**
   * Create a new project document in MongoDB.
   */
  async createProject(data: Partial<RoadmapProject>): Promise<RoadmapProject> {
    const doc = await this.model.create(data);
    return this.toDomain(doc as any)!;
  }

  /**
   * Update an existing project document by its slug.
   */
  async updateProject(
    slug: string,
    data: Partial<RoadmapProject>,
  ): Promise<RoadmapProject | null> {
    const doc = await this.model
      .findOneAndUpdate({ slug }, { $set: data }, { new: true })
      .exec();
    return this.toDomain(doc as any);
  }

  /**
   * Delete a project document by its slug.
   */
  async deleteProject(slug: string): Promise<boolean> {
    const res = await this.model.deleteOne({ slug }).exec();
    return (res.deletedCount ?? 0) > 0;
  }

  /**
   * Check if a project with the given slug already exists.
   */
  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.model.countDocuments({ slug }).exec();
    return count > 0;
  }

  /**
   * Fetch projects submitted by a user (matching any of their userIds, e.g. postgres id or clerk id) with pagination
   */
  async getUserProjects(
    userIds: string[],
    statusFilter?: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<{ projects: RoadmapProject[]; total: number }> {
    if (!userIds || userIds.length === 0) {
      return { projects: [], total: 0 };
    }

    const query: any = {
      "submittedBy.userId": { $in: userIds },
    };

    if (statusFilter && statusFilter.trim().length > 0) {
      query.status = statusFilter.toLowerCase().trim();
    } else {
      // By default exclude archived projects
      query.status = { $ne: "archived" };
    }

    const page = Math.max(1, pagination?.page || 1);
    const limit = Math.min(100, Math.max(1, pagination?.limit || 10));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return {
      projects: this.toDomainArray(docs as any),
      total,
    };
  }
}
