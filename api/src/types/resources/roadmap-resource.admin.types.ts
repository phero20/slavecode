import type {
  RoadmapResource,
  ResourceOrigin,
  ResourceStatus,
  IResourceSubmission,
  IResourceReview,
  IResourceStats,
} from "../../mongo/models/roadmap-resource.model";

export type AdminResourceStatus = "pending" | "approved" | "rejected" | "archived";
export type AdminResourceOrigin = "official" | "community";
export type AdminResourceSort = "newest" | "oldest" | "popular" | "upvotes";

export interface AdminResourceFilter {
  status?: AdminResourceStatus | "all";
  origin?: AdminResourceOrigin | "all";
  roadmapSlug?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: AdminResourceSort;
}

export interface PaginatedAdminResourcesResult {
  resources: RoadmapResource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminResourceStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  archived: number;
  community: number;
  official: number;
}

export interface CreateAdminResourcePayload {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string | null;
  type: string;
  author?: string; // Channel name, platform, or creator (e.g. "FreeCodeCamp")
  roadmapIds: string[];
  order?: number;
  origin?: AdminResourceOrigin;
  status?: AdminResourceStatus;
  adminNotes?: string;
}

export interface UpdateAdminResourcePayload {
  title?: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string | null;
  type?: string;
  author?: string;
  roadmapIds?: string[];
  order?: number;
  origin?: AdminResourceOrigin;
  status?: AdminResourceStatus;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}

export interface ModerateResourcePayload {
  status: AdminResourceStatus;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface IRoadmapResourceAdminRepository {
  getAllResources(
    filter?: AdminResourceFilter
  ): Promise<PaginatedAdminResourcesResult>;
  getResourceById(id: string): Promise<RoadmapResource | null>;
  createResource(
    payload: CreateAdminResourcePayload,
    adminUserId?: string
  ): Promise<RoadmapResource>;
  updateResource(
    id: string,
    payload: UpdateAdminResourcePayload
  ): Promise<RoadmapResource | null>;
  moderateResource(
    id: string,
    payload: ModerateResourcePayload,
    adminUserId?: string
  ): Promise<RoadmapResource | null>;
  deleteResource(id: string): Promise<boolean>;
  getStats(): Promise<AdminResourceStats>;
}

export interface IRoadmapResourceAdminService {
  getAllResources(
    filter?: AdminResourceFilter
  ): Promise<PaginatedAdminResourcesResult>;
  getResourceById(id: string): Promise<RoadmapResource>;
  createResource(
    payload: CreateAdminResourcePayload,
    adminUserId?: string
  ): Promise<RoadmapResource>;
  updateResource(
    id: string,
    payload: UpdateAdminResourcePayload
  ): Promise<RoadmapResource>;
  moderateResource(
    id: string,
    payload: ModerateResourcePayload,
    adminUserId?: string
  ): Promise<RoadmapResource>;
  deleteResource(id: string): Promise<boolean>;
  getStats(): Promise<AdminResourceStats>;
}

