import { MongoBaseRepository } from "../base.repository";
import {
  RoadmapResourceModel,
  type RoadmapResource,
  type RoadmapResourceDocument,
  type ResourceStatus,
  type IResourceReview,
} from "../../mongo/models/roadmap-resource.model";
import type { ICradle } from "../../libs/awilix-container";
import type {
  GetRoadmapResourcesFilter,
  IRoadmapResourceRepository,
  ResourceSortOption,
} from "../../types/resources";

export class RoadmapResourceRepository
  extends MongoBaseRepository<RoadmapResource, RoadmapResourceDocument>
  implements IRoadmapResourceRepository
{
  constructor(_?: ICradle) {
    super(RoadmapResourceModel);
  }

  /**
   * Fetch approved resources/playlists associated with a given roadmap slug.
   */
  async getResourcesByRoadmap(
    roadmapSlug: string,
    type?: string,
    sort?: ResourceSortOption,
  ): Promise<RoadmapResource[]> {
    const cleanSlug = roadmapSlug.toLowerCase().trim();

    const query: any = {
      status: "approved",
      roadmapIds: cleanSlug,
    };

    if (type && type.trim().length > 0) {
      query.type = new RegExp(`^${type.trim()}$`, "i");
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
   * General resource exploration with filtering, search & pagination
   */
  async getAllResources(filter?: GetRoadmapResourcesFilter): Promise<{
    resources: RoadmapResource[];
    total: number;
  }> {
    const query: any = {};

    if (filter?.status && filter.status !== "all") {
      query.status = filter.status;
    } else if (!filter?.status) {
      query.status = "approved";
    }

    if (filter?.roadmapSlug) {
      query.roadmapIds = filter.roadmapSlug.toLowerCase().trim();
    }

    if (filter?.type && filter.type.trim().length > 0) {
      query.type = new RegExp(`^${filter.type.trim()}$`, "i");
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { author: searchRegex },
        { type: searchRegex },
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
      this.model.countDocuments(query as any).exec(),
    ]);

    return {
      resources: this.toDomainArray(docs as any),
      total,
    };
  }

  /**
   * Fetch a single resource by its MongoDB ID
   */
  async getResourceById(id: string): Promise<RoadmapResource | null> {
    return this.findById(id);
  }

  /**
   * Create a new roadmap resource / playlist submission.
   */
  async createResource(
    data: Partial<RoadmapResource>,
  ): Promise<RoadmapResource> {
    const doc = await this.model.create(data);
    return this.toDomain(doc as any)!;
  }

  /**
   * Update an existing resource by its ID
   */
  async updateResource(
    id: string,
    data: Partial<RoadmapResource>,
  ): Promise<RoadmapResource | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .lean()
      .exec();
    return this.toDomain(doc as any);
  }

  /**
   * Delete a resource by its ID
   */
  async deleteResource(id: string): Promise<boolean> {
    const res = await this.model.deleteOne({ _id: id }).exec();
    return (res.deletedCount ?? 0) > 0;
  }

  /**
   * Fetch resources submitted by specific user IDs (for learner profile / submissions page)
   */
  async getUserResources(
    userIds: string[],
    statusFilter?: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<{ resources: RoadmapResource[]; total: number }> {
    if (!userIds || userIds.length === 0) {
      return { resources: [], total: 0 };
    }

    const query: any = {
      "submittedBy.userId": { $in: userIds },
    };

    if (statusFilter && statusFilter.trim().length > 0) {
      query.status = statusFilter.toLowerCase().trim();
    } else {
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
      this.model.countDocuments(query as any).exec(),
    ]);

    return {
      resources: this.toDomainArray(docs as any),
      total,
    };
  }

  /**
   * Fetch pending resources for Admin Review queue
   */
  async getPendingResources(pagination?: {
    page?: number;
    limit?: number;
  }): Promise<{ resources: RoadmapResource[]; total: number }> {
    const query: any = { status: "pending" };
    const page = Math.max(1, pagination?.page || 1);
    const limit = Math.min(100, Math.max(1, pagination?.limit || 20));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(query as any).exec(),
    ]);

    return {
      resources: this.toDomainArray(docs as any),
      total,
    };
  }

  /**
   * Admin status update (e.g. approve or reject with reason)
   */
  async updateStatus(
    id: string,
    status: ResourceStatus,
    reviewData?: IResourceReview,
  ): Promise<RoadmapResource | null> {
    const update: any = { status };
    if (reviewData) {
      update.review = reviewData;
    }

    const doc = await this.model
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean()
      .exec();

    return this.toDomain(doc as any);
  }

  /**
   * Atomically increment or decrement upvote count
   */
  async incrementUpvote(
    id: string,
    delta = 1,
  ): Promise<RoadmapResource | null> {
    const doc = await this.model
      .findByIdAndUpdate(
        id,
        { $inc: { "stats.upvotesCount": delta } },
        { new: true },
      )
      .lean()
      .exec();

    return this.toDomain(doc as any);
  }
}
