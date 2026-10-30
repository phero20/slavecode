export type ResourceOrigin = "official" | "community";
export type ResourceStatus = "pending" | "approved" | "rejected" | "archived";
export type ResourceSortOption = "default" | "newest";

export interface RoadmapResourceItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string | null;
  type: string;
  author?: string;
  roadmapIds: string[];
  order: number;
  origin: ResourceOrigin;
  status: ResourceStatus;
  submittedBy?: {
    userId?: string | null;
    username?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    submittedAt?: string | null;
  };
  review?: {
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
  };
  stats?: {
    upvotesCount: number;
    viewsCount: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface GetRoadmapResourcesParams {
  type?: string | "all";
  sort?: ResourceSortOption;
}

export interface GetResourcesParams {
  roadmap?: string;
  type?: string | "all";
  search?: string;
  page?: number;
  limit?: number;
  sort?: ResourceSortOption;
}

export interface PaginatedResourcesResponse {
  resources: RoadmapResourceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserResourcesResponse {
  resources: RoadmapResourceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isOwner: boolean;
}

export interface GetUserResourcesParams {
  username: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateRoadmapResourcePayload {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string | null;
  type: string;
  author?: string;
  roadmapIds: string[];
}
