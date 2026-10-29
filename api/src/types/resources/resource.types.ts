import { type RoadmapTopic } from "../../mongo/models/roadmap-topic.model";

export interface RoadmapTitle {
  card: string;
  page: string;
  _id?: string;
}

export interface RoadmapSummary {
  id: string;
  slug: string;
  title: RoadmapTitle;
  description: string;
  category: string;
  categories?: string[];
  type?: string;
  status?: string;
  nodesCount: number;
}

export interface RoadmapDetail {
  _id: string;
  title: RoadmapTitle;
  description: string;
  slug: string;
  category: string;
  categories?: string[];
  type?: string;
  status?: string;
  nodes: any[];
  edges?: any[];
  dimensions?: { width: number; height: number };
  relatedRoadmaps?: string[];
  seo?: Record<string, any>;
  [key: string]: any;
}

export interface ResourceCategoryMeta {
  category: string;
  label: string;
  count: number;
}

export interface RoadmapCategoryItem {
  slug: string;
  title: string;
}

export interface RoadmapSection {
  heading: string;
  roadmaps: RoadmapCategoryItem[];
}

export interface RoadmapCategory {
  id: string;
  title: string;
  count: number;
  sections: RoadmapSection[];
}

export interface GetRoadmapsOptions {
  category?: string;
  query?: string;
}

export interface IResourceRepository {
  getAllRoadmaps(category?: string): Promise<RoadmapSummary[]>;
  getRoadmapBySlug(slug: string): Promise<RoadmapDetail | null>;
  searchRoadmaps(query: string): Promise<RoadmapSummary[]>;
  getCategories(): Promise<RoadmapCategory[]>;
}

export interface IResourceService {
  getAllRoadmaps(options?: GetRoadmapsOptions | string): Promise<RoadmapSummary[]>;
  getRoadmapBySlug(slug: string): Promise<RoadmapDetail>;
  searchRoadmaps(query: string): Promise<RoadmapSummary[]>;
  getCategories(): Promise<RoadmapCategory[]>;
  getTopicByNodeId(roadmapSlug: string, nodeId: string): Promise<RoadmapTopic>;
  getTopicsByRoadmap(roadmapSlug: string): Promise<Partial<RoadmapTopic>[]>;
}
