import { MongoBaseRepository } from "../base.repository";
import {
  RoadmapProjectModel,
  type RoadmapProject,
  type RoadmapProjectDocument,
} from "../../mongo/models/roadmap-project.model";
import { mongoose } from "../../mongo/connection";
import type { ICradle } from "../../libs/awilix-container";
import type {
  AdminProjectFilter,
  AdminProjectStats,
  CreateAdminProjectPayload,
  UpdateAdminProjectPayload,
  ModerateProjectPayload,
  PaginatedAdminProjectsResult,
  IRoadmapProjectAdminRepository,
} from "../../types/resources/roadmap-project.admin.types";

export class RoadmapProjectAdminRepository
  extends MongoBaseRepository<RoadmapProject, RoadmapProjectDocument>
  implements IRoadmapProjectAdminRepository
{
  constructor(_?: ICradle) {
    super(RoadmapProjectModel);
  }

  /**
   * Helper to safely build MongoDB filter query from Admin filters
   */
  private buildAdminQuery(filter?: AdminProjectFilter): Record<string, any> {
    const query: Record<string, any> = {};

    if (!filter) return query;

    // Status filter
    if (filter.status && filter.status !== "all") {
      query.status = filter.status.toLowerCase().trim();
    }

    // Origin filter
    if (filter.origin && filter.origin !== "all") {
      query.origin = filter.origin.toLowerCase().trim();
    }

    // Difficulty filter
    if (filter.difficulty && filter.difficulty !== "all") {
      query.difficulty = filter.difficulty.toLowerCase().trim();
    }

    // Roadmap Slug association
    if (filter.roadmapSlug && filter.roadmapSlug.trim()) {
      query.roadmapIds = filter.roadmapSlug.toLowerCase().trim();
    }

    // Full-text / keyword search
    if (filter.search && filter.search.trim()) {
      const sanitized = filter.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(sanitized, "i");
      query.$or = [
        { title: regex },
        { slug: regex },
        { description: regex },
        { topics: regex },
        { skills: regex },
        { "submittedBy.username": regex },
      ];
    }

    return query;
  }

  /**
   * Get all projects for admin moderation dashboard with search, filters & pagination
   */
  async getAllProjects(
    filter?: AdminProjectFilter
  ): Promise<PaginatedAdminProjectsResult> {
    const page = Math.max(1, Number(filter?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter?.limit) || 20));
    const skip = (page - 1) * limit;

    const query = this.buildAdminQuery(filter);

    // Sorting strategy
    let sortOption: Record<string, any> = { createdAt: -1 };
    if (filter?.sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (filter?.sort === "popular") {
      sortOption = { "stats.startedCount": -1, "stats.completedCount": -1 };
    } else if (filter?.sort === "upvotes") {
      sortOption = { "stats.upvotesCount": -1, createdAt: -1 };
    } else if (filter?.sort === "title") {
      sortOption = { title: 1 };
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
      projects: this.toDomainArray(docs as any),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Fetch a single project by slug
   */
  async getProjectBySlug(slug: string): Promise<RoadmapProject | null> {
    if (!slug || !slug.trim()) return null;
    const doc = await this.model
      .findOne({ slug: slug.toLowerCase().trim() })
      .lean()
      .exec();
    return doc ? this.toDomain(doc as any) : null;
  }

  /**
   * Fetch a single project by MongoDB ObjectId
   */
  async getProjectById(id: string): Promise<RoadmapProject | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.toDomain(doc as any) : null;
  }

  /**
   * Helper to find by slug or ObjectId
   */
  private async findBySlugOrId(slugOrId: string) {
    const clean = slugOrId.trim();
    if (mongoose.Types.ObjectId.isValid(clean)) {
      const byId = await this.model.findById(clean).exec();
      if (byId) return byId;
    }
    return this.model.findOne({ slug: clean.toLowerCase() }).exec();
  }

  /**
   * Create a new project from Admin panel (official or community)
   */
  async createProject(
    payload: CreateAdminProjectPayload,
    adminUserId?: string
  ): Promise<RoadmapProject> {
    const origin = payload.origin || "official";
    const status = payload.status || "approved";

    // Generate slug from title if not given
    const slug = (
      payload.slug?.trim() ||
      payload.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    ).toLowerCase();

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

    const projectData: Partial<RoadmapProject> = {
      slug,
      title: payload.title.trim(),
      description: payload.description.trim(),
      difficulty: payload.difficulty,
      roadmapIds: (payload.roadmapIds || []).map((id) =>
        id.toLowerCase().trim()
      ),
      topics: (payload.topics || []).map((t) => t.trim()).filter(Boolean),
      skills: (payload.skills || []).map((s) => s.trim()).filter(Boolean),
      order: 0,
      type: payload.type?.trim() || "code",
      content: {
        overview: payload.content?.overview?.trim() || "",
        markdown: payload.content?.markdown?.trim() || "",
        previewImage: payload.content?.previewImage?.trim() || null,
        requirements: payload.content?.requirements || [],
        checklist: payload.content?.checklist || [],
        bonusChallenges: payload.content?.bonusChallenges || [],
        suggestedTechStack: payload.content?.suggestedTechStack || [],
      },
      origin,
      status,
      submittedBy: submitter,
      review,
      stats: {
        startedCount: 0,
        completedCount: 0,
        upvotesCount: 0,
      },
    };

    const doc = await this.model.create(projectData);
    return this.toDomain(doc as any)!;
  }

  /**
   * Update an existing project.
   * STRICT GUARANTEE: Never alters or overwrites the original author (submittedBy)!
   */
  async updateProject(
    slugOrId: string,
    payload: UpdateAdminProjectPayload
  ): Promise<RoadmapProject | null> {
    const existing = await this.findBySlugOrId(slugOrId);
    if (!existing) return null;

    const updateFields: Record<string, any> = {};

    if (payload.title !== undefined) updateFields.title = payload.title.trim();
    if (payload.description !== undefined)
      updateFields.description = payload.description.trim();
    if (payload.difficulty !== undefined)
      updateFields.difficulty = payload.difficulty;
    if (payload.roadmapIds !== undefined) {
      updateFields.roadmapIds = payload.roadmapIds.map((id) =>
        id.toLowerCase().trim()
      );
    }
    if (payload.topics !== undefined) {
      updateFields.topics = payload.topics
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (payload.skills !== undefined) {
      updateFields.skills = payload.skills
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (payload.type !== undefined) updateFields.type = payload.type.trim();

    if (payload.content) {
      if (payload.content.overview !== undefined)
        updateFields["content.overview"] = payload.content.overview.trim();
      if (payload.content.markdown !== undefined)
        updateFields["content.markdown"] = payload.content.markdown.trim();
      if (payload.content.previewImage !== undefined)
        updateFields["content.previewImage"] =
          payload.content.previewImage?.trim() || null;
      if (payload.content.requirements !== undefined)
        updateFields["content.requirements"] = payload.content.requirements;
      if (payload.content.checklist !== undefined)
        updateFields["content.checklist"] = payload.content.checklist;
      if (payload.content.bonusChallenges !== undefined)
        updateFields["content.bonusChallenges"] =
          payload.content.bonusChallenges;
      if (payload.content.suggestedTechStack !== undefined)
        updateFields["content.suggestedTechStack"] =
          payload.content.suggestedTechStack;
    }

    if (payload.origin !== undefined) updateFields.origin = payload.origin;
    if (payload.status !== undefined) updateFields.status = payload.status;

    if (payload.rejectionReason !== undefined) {
      updateFields["review.rejectionReason"] = payload.rejectionReason;
    }
    if (payload.adminNotes !== undefined) {
      updateFields["review.adminNotes"] = payload.adminNotes;
    }

    // STRICT CHECK: Ensure submittedBy is never touched
    delete updateFields.submittedBy;
    delete updateFields["submittedBy.userId"];
    delete updateFields["submittedBy.username"];

    const updated = await this.model
      .findByIdAndUpdate(
        existing._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      )
      .lean()
      .exec();

    return updated ? this.toDomain(updated as any) : null;
  }

  /**
   * Fast moderation update (approve, reject, archive)
   */
  async moderateProject(
    slugOrId: string,
    payload: ModerateProjectPayload,
    adminUserId?: string
  ): Promise<RoadmapProject | null> {
    const existing = await this.findBySlugOrId(slugOrId);
    if (!existing) return null;

    const reviewUpdate: Record<string, any> = {
      reviewedBy: adminUserId || "admin",
      reviewedAt: new Date(),
    };

    if (payload.rejectionReason !== undefined) {
      reviewUpdate.rejectionReason = payload.rejectionReason.trim();
    }
    if (payload.adminNotes !== undefined) {
      reviewUpdate.adminNotes = payload.adminNotes.trim();
    }

    const updated = await this.model
      .findByIdAndUpdate(
        existing._id,
        {
          $set: {
            status: payload.status,
            review: {
              ...((existing.review as any) || {}),
              ...reviewUpdate,
            },
          },
        },
        { new: true }
      )
      .lean()
      .exec();

    return updated ? this.toDomain(updated as any) : null;
  }

  /**
   * Hard delete a project
   */
  async deleteProject(slugOrId: string): Promise<boolean> {
    const existing = await this.findBySlugOrId(slugOrId);
    if (!existing) return false;

    const res = await this.model.findByIdAndDelete(existing._id).exec();
    return Boolean(res);
  }

  /**
   * Aggregate statistics for project dashboard
   */
  async getStats(): Promise<AdminProjectStats> {
    const [
      total,
      pending,
      approved,
      rejected,
      archived,
      community,
      official,
    ] = await Promise.all([
      this.model.countDocuments({}).exec(),
      this.model.countDocuments({ status: "pending" }).exec(),
      this.model.countDocuments({ status: "approved" }).exec(),
      this.model.countDocuments({ status: "rejected" }).exec(),
      this.model.countDocuments({ status: "archived" }).exec(),
      this.model.countDocuments({ origin: "community" }).exec(),
      this.model.countDocuments({ origin: "official" }).exec(),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      archived,
      community,
      official,
    };
  }
}
