import {
  type IResourceRepository,
  type RoadmapSummary,
  type RoadmapDetail,
  type RoadmapCategory,
  type GetRoadmapsOptions,
  type IResourceService,
} from "../../types/resources";
import { type IRoadmapTopicRepository } from "../../repositories/resources/roadmap-topic.repository";
import { type RoadmapTopic } from "../../mongo/models/roadmap-topic.model";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";

// Re-export types for backward compatibility
export type { GetRoadmapsOptions, IResourceService };

const logger = createLogger("resource.service");


export class ResourceService implements IResourceService {
  private readonly resourceRepository: IResourceRepository;
  private readonly roadmapTopicRepository: IRoadmapTopicRepository;

  constructor({ resourceRepository, roadmapTopicRepository }: ICradle) {
    this.resourceRepository = resourceRepository;
    this.roadmapTopicRepository = roadmapTopicRepository;
  }

  async getAllRoadmaps(options?: GetRoadmapsOptions | string): Promise<RoadmapSummary[]> {
    const category = typeof options === "string" ? options : options?.category;
    const query = typeof options === "object" ? options?.query : undefined;

    try {
      if (query && query.trim().length > 0) {
        let results = await this.resourceRepository.searchRoadmaps(query);
        if (category && category !== "all") {
          results = results.filter((r) => r.category === category);
        }
        return results;
      }
      return await this.resourceRepository.getAllRoadmaps(category);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, category, query }, "Failed to fetch roadmaps");
      throw new AppError("Failed to fetch roadmaps", { statusCode: 500 });
    }
  }

  async getRoadmapBySlug(slug: string): Promise<RoadmapDetail> {
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }

    try {
      const roadmap = await this.resourceRepository.getRoadmapBySlug(slug);
      if (!roadmap) {
        throw AppError.notFound(`Roadmap '${slug}' not found`);
      }
      return roadmap;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slug }, "Failed to fetch roadmap details");
      throw new AppError("Failed to fetch roadmap details", { statusCode: 500 });
    }
  }

  async searchRoadmaps(query: string): Promise<RoadmapSummary[]> {
    try {
      return await this.resourceRepository.searchRoadmaps(query);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, query }, "Failed to search roadmaps");
      throw new AppError("Failed to search roadmaps", { statusCode: 500 });
    }
  }

  async getCategories(): Promise<RoadmapCategory[]> {
    try {
      return await this.resourceRepository.getCategories();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error }, "Failed to fetch categories");
      throw new AppError("Failed to fetch categories", { statusCode: 500 });
    }
  }

  async getTopicByNodeId(roadmapSlug: string, nodeId: string): Promise<RoadmapTopic> {
    if (!roadmapSlug || !nodeId) {
      throw AppError.badRequest("Roadmap slug and node ID are required");
    }

    try {
      const topic = await this.roadmapTopicRepository.getTopicByNodeId(roadmapSlug, nodeId);
      if (!topic) {
        throw AppError.notFound(`Topic for node '${nodeId}' not found in roadmap '${roadmapSlug}'`);
      }
      return topic;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, roadmapSlug, nodeId }, "Failed to fetch topic details");
      throw new AppError("Failed to fetch topic details", { statusCode: 500 });
    }
  }

  async getTopicsByRoadmap(roadmapSlug: string): Promise<Partial<RoadmapTopic>[]> {
    if (!roadmapSlug) {
      throw AppError.badRequest("Roadmap slug is required");
    }

    try {
      return await this.roadmapTopicRepository.getTopicsByRoadmap(roadmapSlug);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, roadmapSlug }, "Failed to fetch roadmap topics");
      throw new AppError("Failed to fetch roadmap topics", { statusCode: 500 });
    }
  }
}

