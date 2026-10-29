import { MongoBaseRepository } from "../base.repository";
import {
  RoadmapTopicModel,
  type RoadmapTopic,
  type RoadmapTopicDocument,
} from "../../mongo/models/roadmap-topic.model";
import type { ICradle } from "../../libs/awilix-container";

export interface IRoadmapTopicRepository {
  getTopicByNodeId(
    roadmapSlug: string,
    nodeId: string
  ): Promise<RoadmapTopic | null>;
  getTopicBySlug(
    roadmapSlug: string,
    topicSlug: string
  ): Promise<RoadmapTopic | null>;
  getTopicsByRoadmap(
    roadmapSlug: string
  ): Promise<Partial<RoadmapTopic>[]>;
}

export class RoadmapTopicRepository
  extends MongoBaseRepository<RoadmapTopic, RoadmapTopicDocument>
  implements IRoadmapTopicRepository
{
  constructor(_?: ICradle) {
    super(RoadmapTopicModel);
  }

  /**
   * Primary point lookup by node ID from the interactive canvas
   */
  async getTopicByNodeId(
    roadmapSlug: string,
    nodeId: string
  ): Promise<RoadmapTopic | null> {
    const doc = await this.model
      .findOne({
        roadmapSlug: roadmapSlug.toLowerCase().trim(),
        nodeId: nodeId.trim(),
      })
      .lean()
      .exec();

    if (!doc) return null;
    return this.toDomain(doc as any);
  }

  /**
   * Lookup by topic slug for deep-linking or custom routing
   */
  async getTopicBySlug(
    roadmapSlug: string,
    topicSlug: string
  ): Promise<RoadmapTopic | null> {
    const doc = await this.model
      .findOne({
        roadmapSlug: roadmapSlug.toLowerCase().trim(),
        topicSlug: topicSlug.toLowerCase().trim(),
      })
      .lean()
      .exec();

    if (!doc) return null;
    return this.toDomain(doc as any);
  }

  /**
   * Lightweight topic list for a roadmap (excludes full raw markdown)
   */
  async getTopicsByRoadmap(
    roadmapSlug: string
  ): Promise<Partial<RoadmapTopic>[]> {
    const docs = await this.model
      .find({ roadmapSlug: roadmapSlug.toLowerCase().trim() })
      .select("nodeId topicSlug title resources createdAt updatedAt")
      .lean()
      .exec();

    return this.toDomainArray(docs as any);
  }
}
