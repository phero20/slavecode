import mongoose from "mongoose";
import { MongoBaseRepository } from "../base.repository";
import {
  RoadmapResourceModel,
  type RoadmapResource,
  type RoadmapResourceDocument,
} from "../../mongo/models/roadmap-resource.model";
import type { ICradle } from "../../libs/awilix-container";
import type {
  AdminResourceFilter,
  PaginatedAdminResourcesResult,
  AdminResourceStats,
  CreateAdminResourcePayload,
  UpdateAdminResourcePayload,
  ModerateResourcePayload,
  IRoadmapResourceAdminRepository,
} from "../../types/resources/roadmap-resource.admin.types";

export class RoadmapResourceAdminRepository
  extends MongoBaseRepository<RoadmapResource, RoadmapResourceDocument>
  implements IRoadmapResourceAdminRepository
{
  constructor(_?: ICradle) {
    super(RoadmapResourceModel);
  }

  protected override toDomainArray(docs: any[]): RoadmapResource[] {
    return docs.map((doc) => this.toDomain(doc)).filter(Boolean) as RoadmapResource[];
  }

  /**
   * Fetch all resources with comprehensive administrative filters, search, and pagination
   */
  async getAllResources(
    filter?: AdminResourceFilter
  ): Promise<PaginatedAdminResourcesResult> {
    const query: any = {};

    if (filter?.status && filter.status !== "all") {
      query.status = filter.status.toLowerCase().trim();
    }

    if (filter?.origin && filter.origin !== "all") {
      query.origin = filter.origin.toLowerCase().trim();
    }

    if (filter?.roadmapSlug && filter.roadmapSlug !== "all") {
      query.roadmapIds = filter.roadmapSlug.toLowerCase().trim();
    }

    if (filter?.type && filter.type.trim().length > 0 && filter.type !== "all") {
      query.type = new RegExp(`^${filter.type.trim()}$`, "i");
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { author: searchRegex },
        { url: searchRegex },
        { type: searchRegex },
        { "submittedBy.username": searchRegex },
        { "submittedBy.fullName": searchRegex },
      ];
    }

    const page = Math.max(1, Number(filter?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter?.limit) || 20));
    const skip = (page - 1) * limit;

    let sortOption: any = { createdAt: -1, _id: -1 };
    if (filter?.sort === "oldest") {
      sortOption = { createdAt: 1, _id: 1 };
    } else if (filter?.sort === "popular" || filter?.sort === "upvotes") {
      sortOption = { "stats.upvotesCount": -1, createdAt: -1, _id: -1 };
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return {
      resources: this.toDomainArray(docs as any),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Fetch single resource by MongoDB ID
   */
  async getResourceById(id: string): Promise<RoadmapResource | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.findById(id);
  }

  /**
   * Create a new resource as an admin (official or community)
   */
  async createResource(
    payload: CreateAdminResourcePayload,
    adminUserId?: string
  ): Promise<RoadmapResource> {
    const origin = payload.origin || "official";
    const status = payload.status || "approved";

    const submitter =
      origin === "community" && adminUserId
        ? {
            userId: adminUserId,
            submittedAt: new Date(),
          }
        : undefined;

    const review =
      status === "approved"
        ? {
            reviewedBy: adminUserId || "admin",
            reviewedAt: new Date(),
            adminNotes: payload.adminNotes || "Created by administrator",
          }
        : payload.adminNotes
        ? {
            reviewedBy: adminUserId || "admin",
            reviewedAt: new Date(),
            adminNotes: payload.adminNotes,
          }
        : undefined;

    const resourceData: Partial<RoadmapResource> = {
      title: payload.title.trim(),
      description: payload.description?.trim() || "",
      url: payload.url.trim(),
      thumbnailUrl: payload.thumbnailUrl?.trim() || null,
      type: payload.type.trim(),
      author: payload.author?.trim() || "",
      roadmapIds: (payload.roadmapIds || []).map((id) =>
        id.toLowerCase().trim()
      ),
      order: payload.order ?? 0,
      origin,
      status,
      submittedBy: submitter,
      review,
      stats: {
        upvotesCount: 0,
        viewsCount: 0,
      },
    };

    const doc = await this.model.create(resourceData);
    return this.toDomain(doc as any)!;
  }

  /**
   * Update an existing resource.
   * STRICT GUARANTEE: Never alters or overwrites the original author (submittedBy)!
   */
  async updateResource(
    id: string,
    payload: UpdateAdminResourcePayload
  ): Promise<RoadmapResource | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const existing = await this.model.findById(id).lean().exec();
    if (!existing) {
      return null;
    }

    const updateFields: any = {};

    if (payload.title !== undefined) updateFields.title = payload.title.trim();
    if (payload.description !== undefined)
      updateFields.description = payload.description.trim();
    if (payload.url !== undefined) updateFields.url = payload.url.trim();
    if (payload.thumbnailUrl !== undefined)
      updateFields.thumbnailUrl = payload.thumbnailUrl?.trim() || null;
    if (payload.type !== undefined) updateFields.type = payload.type.trim();
    if (payload.author !== undefined) updateFields.author = payload.author.trim();
    if (payload.order !== undefined) updateFields.order = Number(payload.order) || 0;
    if (payload.origin !== undefined) updateFields.origin = payload.origin;
    if (payload.status !== undefined) updateFields.status = payload.status;
    if (payload.roadmapIds !== undefined) {
      updateFields.roadmapIds = payload.roadmapIds.map((rid) =>
        rid.toLowerCase().trim()
      );
    }

    // Handle review notes / rejection reason if supplied
    if (
      payload.rejectionReason !== undefined ||
      payload.adminNotes !== undefined
    ) {
      const existingReview = (existing as any).review || {};
      updateFields.review = {
        ...existingReview,
        ...(payload.rejectionReason !== undefined && {
          rejectionReason: payload.rejectionReason,
        }),
        ...(payload.adminNotes !== undefined && {
          adminNotes: payload.adminNotes,
        }),
      };
    }

    // NOTICE: submittedBy is intentionally NEVER added to updateFields,
    // ensuring the original submitter/author is preserved 100%.

    const updated = await this.model
      .findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .lean()
      .exec();

    return this.toDomain(updated as any);
  }

  /**
   * Moderate resource status (approve, reject, archive) with audit tracking
   */
  async moderateResource(
    id: string,
    payload: ModerateResourcePayload,
    adminUserId: string
  ): Promise<RoadmapResource | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const existing = (await this.model.findById(id).lean().exec()) as any;
    if (!existing) {
      return null;
    }

    const currentReview = existing.review || {};

    const updatedReview = {
      ...currentReview,
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
      rejectionReason:
        payload.status === "rejected"
          ? payload.rejectionReason || currentReview.rejectionReason || null
          : null,
      adminNotes: payload.adminNotes ?? currentReview.adminNotes ?? null,
    };

    const updated = await this.model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: payload.status,
            review: updatedReview,
          },
        },
        { new: true }
      )
      .lean()
      .exec();

    return this.toDomain(updated as any);
  }

  /**
   * Permanently delete a resource
   */
  async deleteResource(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const res = await this.model.findByIdAndDelete(id).exec();
    return Boolean(res);
  }

  /**
   * Aggregate statistics for the resource moderation dashboard
   */
  async getStats(): Promise<AdminResourceStats> {
    const [countsByStatus, countsByOrigin] = await Promise.all([
      this.model.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      this.model.aggregate([
        {
          $group: {
            _id: "$origin",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats: AdminResourceStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      archived: 0,
      community: 0,
      official: 0,
    };

    countsByStatus.forEach((item: any) => {
      const status = item._id as keyof typeof stats;
      if (status in stats) {
        (stats as any)[status] = item.count;
      }
      stats.total += item.count;
    });

    countsByOrigin.forEach((item: any) => {
      if (item._id === "community") stats.community = item.count;
      if (item._id === "official") stats.official = item.count;
    });

    return stats;
  }
}

