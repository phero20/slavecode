import mongoose from "mongoose";
import { MongoBaseRepository } from "../base.repository";
import {
  RoadmapModel,
  type RoadmapDocument,
  type Roadmap,
} from "../../mongo/models/roadmap.model";
import {
  RoadmapCategoryModel,
  type RoadmapCategoryDocument,
  type RoadmapCategory,
} from "../../mongo/models/roadmap-category.model";
import type {
  CreateRoadmapCategoryPayload,
  UpdateRoadmapCategoryPayload,
  CreateRoadmapPayload,
  UpdateRoadmapPayload,
  RoadmapAdminListFilter,
  ResourceAdminStats,
  IResourceAdminRepository,
} from "../../types/resources/resource.admin.types";
import type { ICradle } from "../../libs/awilix-container";

export class ResourceAdminRepository
  extends MongoBaseRepository<Roadmap, RoadmapDocument>
  implements IResourceAdminRepository
{
  constructor(_?: ICradle) {
    super(RoadmapModel);
  }

  // ==========================================
  // STATS
  // ==========================================

  async getStats(): Promise<ResourceAdminStats> {
    const [total, published, draft, archived, categoriesCount, nodesAgg] =
      await Promise.all([
        this.model.countDocuments(),
        this.model.countDocuments({ status: "published" }),
        this.model.countDocuments({ status: "draft" }),
        this.model.countDocuments({ status: "archived" }),
        RoadmapCategoryModel.countDocuments(),
        this.model.aggregate([
          { $group: { _id: null, totalNodes: { $sum: "$nodesCount" } } },
        ]),
      ]);

    return {
      roadmaps: {
        total,
        published,
        draft,
        archived,
      },
      categories: categoriesCount,
      totalNodes: nodesAgg[0]?.totalNodes || 0,
    };
  }

  // ==========================================
  // ROADMAP CATEGORY OPERATIONS
  // ==========================================

  async getAllCategories(): Promise<RoadmapCategory[]> {
    const docs = await RoadmapCategoryModel.find()
      .sort({ order: 1, title: 1 })
      .lean()
      .exec();

    return docs.map((doc: any) => ({
      id: doc._id.toString(),
      categoryId: doc.categoryId,
      title: doc.title,
      count: doc.count || 0,
      order: doc.order || 0,
      sections: doc.sections || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async getCategoryById(id: string): Promise<RoadmapCategory | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId
      ? { $or: [{ _id: id }, { categoryId: id }] }
      : { categoryId: id };

    const doc: any = await RoadmapCategoryModel.findOne(filter).lean().exec();
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      categoryId: doc.categoryId,
      title: doc.title,
      count: doc.count || 0,
      order: doc.order || 0,
      sections: doc.sections || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async getCategoryByCategoryId(
    categoryId: string
  ): Promise<RoadmapCategory | null> {
    const cleanId = categoryId.toLowerCase().trim();
    const doc: any = await RoadmapCategoryModel.findOne({ categoryId: cleanId })
      .lean()
      .exec();
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      categoryId: doc.categoryId,
      title: doc.title,
      count: doc.count || 0,
      order: doc.order || 0,
      sections: doc.sections || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createCategory(
    payload: CreateRoadmapCategoryPayload
  ): Promise<RoadmapCategory> {
    const cleanPayload = {
      ...payload,
      categoryId: payload.categoryId.toLowerCase().trim(),
    };

    const doc: any = await RoadmapCategoryModel.create(cleanPayload);
    return {
      id: doc._id.toString(),
      categoryId: doc.categoryId,
      title: doc.title,
      count: doc.count || 0,
      order: doc.order || 0,
      sections: doc.sections || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async updateCategory(
    id: string,
    payload: UpdateRoadmapCategoryPayload
  ): Promise<RoadmapCategory | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId
      ? { $or: [{ _id: id }, { categoryId: id }] }
      : { categoryId: id };

    const doc: any = await RoadmapCategoryModel.findOneAndUpdate(
      filter,
      { $set: payload },
      { new: true }
    )
      .lean()
      .exec();

    if (!doc) return null;

    return {
      id: doc._id.toString(),
      categoryId: doc.categoryId,
      title: doc.title,
      count: doc.count || 0,
      order: doc.order || 0,
      sections: doc.sections || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async deleteCategory(id: string): Promise<boolean> {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId
      ? { $or: [{ _id: id }, { categoryId: id }] }
      : { categoryId: id };

    const result = await RoadmapCategoryModel.findOneAndDelete(filter).exec();
    return Boolean(result);
  }

  // ==========================================
  // ROADMAP OPERATIONS
  // ==========================================

  async getAllRoadmaps(filter?: RoadmapAdminListFilter): Promise<Roadmap[]> {
    const query: any = {};

    if (filter?.category && filter.category !== "all") {
      query.categories = filter.category.toLowerCase().trim();
    }

    if (filter?.status && filter.status !== "all") {
      query.status = filter.status.toLowerCase().trim();
    }

    if (filter?.type) {
      query.type = filter.type;
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const q = filter.search.trim();
      query.$or = [
        { slug: { $regex: q, $options: "i" } },
        { "title.card": { $regex: q, $options: "i" } },
        { "title.page": { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const docs = await this.model
      .find(query)
      .sort({ "title.card": 1 })
      .lean()
      .exec();

    return this.toDomainArray(docs as any);
  }

  async getRoadmapBySlug(slug: string): Promise<Roadmap | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const doc = await this.model.findOne({ slug: cleanSlug }).lean().exec();
    return this.toDomain(doc as any);
  }

  async getRoadmapById(id: string): Promise<Roadmap | null> {
    const doc = await this.model.findById(id).lean().exec();
    return this.toDomain(doc as any);
  }

  async createRoadmap(payload: CreateRoadmapPayload): Promise<Roadmap> {
    const cleanPayload: any = {
      ...payload,
      slug: payload.slug.toLowerCase().trim(),
      nodesCount: payload.nodes?.length || 0,
      categories: (payload.categories || []).map((c) => c.toLowerCase().trim()),
    };

    const doc = await this.model.create(cleanPayload);
    return this.toDomain(doc as any) as Roadmap;
  }

  async updateRoadmap(
    slug: string,
    payload: UpdateRoadmapPayload
  ): Promise<Roadmap | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const updateData: any = { ...payload };

    if (payload.categories) {
      updateData.categories = payload.categories.map((c) =>
        c.toLowerCase().trim()
      );
    }

    if (payload.nodes !== undefined) {
      updateData.nodesCount = payload.nodes.length;
    }

    const doc = await this.model
      .findOneAndUpdate(
        { slug: cleanSlug },
        { $set: updateData },
        { new: true }
      )
      .lean()
      .exec();

    return this.toDomain(doc as any);
  }

  async updateRoadmapStatus(
    slug: string,
    status: string
  ): Promise<Roadmap | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const doc = await this.model
      .findOneAndUpdate(
        { slug: cleanSlug },
        { $set: { status: status.toLowerCase().trim() } },
        { new: true }
      )
      .lean()
      .exec();

    return this.toDomain(doc as any);
  }

  async deleteRoadmap(slug: string): Promise<boolean> {
    const cleanSlug = slug.toLowerCase().trim();
    const result = await this.model.findOneAndDelete({ slug: cleanSlug }).exec();
    return Boolean(result);
  }

  async getRoadmapsCountByCategory(categoryId: string): Promise<number> {
    const cleanId = categoryId.toLowerCase().trim();
    return this.model.countDocuments({
      categories: cleanId,
      status: "published",
    });
  }

  async syncCategoryCounts(): Promise<void> {
    const categories = await RoadmapCategoryModel.find().lean().exec();

    for (const cat of categories) {
      const count = await this.model.countDocuments({
        categories: cat.categoryId,
        status: "published",
      });

      await RoadmapCategoryModel.updateOne(
        { _id: cat._id },
        { $set: { count } }
      );
    }
  }

  protected override toDomainArray(docs: any[]): Roadmap[] {
    return docs
      .map((doc) => this.toDomain(doc))
      .filter((item): item is Roadmap => item !== null);
  }
}
