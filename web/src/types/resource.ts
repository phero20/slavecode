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
  type?: string;
  status?: string;
  nodesCount: number;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  type?: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RoadmapEdge {
  id?: string;
  source: string;
  target: string;
  type?: string;
  [key: string]: unknown;
}

export interface RoadmapDetail {
  _id: string;
  slug: string;
  title: RoadmapTitle;
  description: string;
  category: string;
  categories?: string[];
  type?: string;
  status?: string;
  nodes: RoadmapNode[];
  edges?: RoadmapEdge[];
  dimensions?: { width: number; height: number };
  relatedRoadmaps?: string[];
  seo?: Record<string, unknown>;
  [key: string]: unknown;
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

export interface GetRoadmapsParams {
  category?: string;
  query?: string;
}

export type TopicResourceType =
  | "official"
  | "article"
  | "video"
  | "course"
  | "roadmap"
  | "book"
  | "podcast"
  | "opensource"
  | "other";

export interface TopicResourceItem {
  title: string;
  url: string;
  type: TopicResourceType;
}

export interface RoadmapTopic {
  id: string;
  roadmapSlug: string;
  nodeId: string;
  topicSlug: string;
  title: string;
  description: string;
  resources: TopicResourceItem[];
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

