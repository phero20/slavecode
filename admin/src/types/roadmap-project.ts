export type AdminProjectStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "archived"
  | "updated";

export type AdminProjectOrigin = "official" | "community";

export type AdminProjectDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type AdminProjectSort =
  | "newest"
  | "oldest"
  | "popular"
  | "upvotes"
  | "title";

export interface ProjectContentInfo {
  overview?: string;
  markdown?: string;
  previewImage?: string | null;
  requirements?: string[];
  checklist?: string[];
  bonusChallenges?: string[];
  suggestedTechStack?: string[];
}

export interface ProjectSubmissionInfo {
  userId?: string | null;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  submittedAt?: string | Date | null;
}

export interface ProjectReviewInfo {
  reviewedBy?: string | null;
  reviewedAt?: string | Date | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}

export interface ProjectStatsInfo {
  startedCount: number;
  completedCount: number;
  upvotesCount: number;
}

export interface RoadmapProject {
  id: string;
  _id?: string;
  slug: string;
  title: string;
  description: string;
  difficulty: AdminProjectDifficulty;
  roadmapIds: string[];
  topics?: string[];
  skills?: string[];
  order: number;
  type: string;
  content: ProjectContentInfo;
  origin: AdminProjectOrigin;
  status: AdminProjectStatus;
  submittedBy?: ProjectSubmissionInfo;
  review?: ProjectReviewInfo;
  stats?: ProjectStatsInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProjectStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  archived: number;
  community: number;
  official: number;
}

export interface AdminProjectFilter {
  status?: AdminProjectStatus | "all";
  origin?: AdminProjectOrigin | "all";
  difficulty?: AdminProjectDifficulty | "all";
  roadmapSlug?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: AdminProjectSort;
}

export interface PaginatedAdminProjectsResult {
  projects: RoadmapProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminProjectPayload {
  slug?: string;
  title: string;
  description: string;
  difficulty: AdminProjectDifficulty;
  roadmapIds: string[];
  topics?: string[];
  skills?: string[];
  type?: string;
  content?: ProjectContentInfo;
  origin?: AdminProjectOrigin;
  status?: AdminProjectStatus;
  adminNotes?: string;
}

export interface UpdateAdminProjectPayload {
  title?: string;
  description?: string;
  difficulty?: AdminProjectDifficulty;
  roadmapIds?: string[];
  topics?: string[];
  skills?: string[];
  type?: string;
  content?: ProjectContentInfo;
  origin?: AdminProjectOrigin;
  status?: AdminProjectStatus;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}

export interface ModerateProjectPayload {
  status: AdminProjectStatus;
  rejectionReason?: string;
  adminNotes?: string;
}

