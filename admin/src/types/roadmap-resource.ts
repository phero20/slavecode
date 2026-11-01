export type AdminResourceStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "archived";

export type AdminResourceOrigin = "official" | "community";

export type AdminResourceSort = "newest" | "oldest" | "popular" | "upvotes";

export interface ResourceSubmissionInfo {
  userId?: string | null;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  submittedAt?: string | Date | null;
}

export interface ResourceReviewInfo {
  reviewedBy?: string | null;
  reviewedAt?: string | Date | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}

export interface ResourceStatsInfo {
  upvotesCount: number;
  viewsCount: number;
}

export interface RoadmapResource {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string | null;
  type: string;
  author?: string;
  roadmapIds: string[];
  order: number;
  origin: AdminResourceOrigin;
  status: AdminResourceStatus;
  submittedBy?: ResourceSubmissionInfo;
  review?: ResourceReviewInfo;
  stats?: ResourceStatsInfo;
  createdAt?: string;
  updatedAt?: string;
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

export interface CreateAdminResourcePayload {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string | null;
  type: string;
  author?: string;
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

