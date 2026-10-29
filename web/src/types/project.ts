export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";
export type ProjectOrigin = "official" | "community";
export type ProjectStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "archived"
  | "updated";

export interface ProjectContent {
  overview: string;
  markdown?: string;
  previewImage?: string | null;
  requirements: string[];
  checklist: string[];
  bonusChallenges?: string[];
  suggestedTechStack?: string[];
}

export interface RoadmapProjectItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  roadmapIds: string[];
  topics: string[];
  skills: string[];
  order: number;
  type?: string;
  origin: ProjectOrigin;
  status: ProjectStatus;
  content?: ProjectContent;
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
    startedCount: number;
    completedCount: number;
    upvotesCount: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Convenient alias for general project listings
export type ProjectItem = RoadmapProjectItem;

export type ProjectSortOption = "default" | "newest";

export interface GetRoadmapProjectsParams {
  difficulty?: ProjectDifficulty | "all";
  sort?: ProjectSortOption;
}

export interface GetProjectsParams {
  roadmap?: string;
  difficulty?: ProjectDifficulty | "all";
  search?: string;
  topic?: string;
  page?: number;
  limit?: number;
  sort?: ProjectSortOption;
}

export interface PaginatedProjectsResponse {
  projects: RoadmapProjectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserProjectsResponse {
  projects: RoadmapProjectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isOwner: boolean;
}

export interface GetUserProjectsParams {
  username: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProjectCategory {
  id: string;
  title: string;
  count: number;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  roadmapIds: string[];
  topics?: string[];
  skills?: string[];
  content?: {
    overview?: string;
    markdown?: string;
    previewImage?: string | null;
    requirements?: string[];
    checklist?: string[];
    bonusChallenges?: string[];
    suggestedTechStack?: string[];
  };
}
