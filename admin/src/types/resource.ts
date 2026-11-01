export interface RoadmapTitle {
  card: string;
  page: string;
}

export interface RoadmapItemRef {
  slug: string;
  title: string;
}

export interface RoadmapCategorySection {
  heading: string;
  roadmaps: RoadmapItemRef[];
}

export interface RoadmapCategory {
  id?: string;
  categoryId: string;
  title: string;
  count: number;
  order: number;
  sections: RoadmapCategorySection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Roadmap {
  id?: string;
  slug: string;
  title: RoadmapTitle;
  description: string;
  type: "role" | "skill";
  categories: string[];
  nodesCount: number;
  nodes?: any[];
  edges?: any[];
  dimensions?: { width?: number; height?: number };
  relatedRoadmaps?: string[];
  seo?: Record<string, any>;
  status: "published" | "draft" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceAdminStats {
  roadmaps: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  categories: number;
  totalNodes: number;
}

export interface CreateRoadmapCategoryPayload {
  categoryId: string;
  title: string;
  order?: number;
  sections?: RoadmapCategorySection[];
}

export interface UpdateRoadmapCategoryPayload {
  title?: string;
  order?: number;
  sections?: RoadmapCategorySection[];
}

export interface CreateRoadmapPayload {
  slug: string;
  title: RoadmapTitle;
  description?: string;
  type?: "role" | "skill";
  categories?: string[];
  nodes?: any[];
  edges?: any[];
  dimensions?: { width?: number; height?: number };
  relatedRoadmaps?: string[];
  seo?: Record<string, any>;
  status?: "published" | "draft" | "archived";
}

export interface UpdateRoadmapPayload {
  title?: RoadmapTitle;
  description?: string;
  type?: "role" | "skill";
  categories?: string[];
  nodes?: any[];
  edges?: any[];
  dimensions?: { width?: number; height?: number };
  relatedRoadmaps?: string[];
  seo?: Record<string, any>;
  status?: "published" | "draft" | "archived";
}

export interface RoadmapAdminListFilter {
  category?: string;
  status?: string;
  search?: string;
  type?: "role" | "skill";
}

export * from "./roadmap-resource";
export * from "./roadmap-project";



