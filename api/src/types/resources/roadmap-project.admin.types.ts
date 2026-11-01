import type {
  RoadmapProject,
  ProjectOrigin,
  ProjectStatus,
  ProjectDifficulty,
  IProjectContent,
} from "../../mongo/models/roadmap-project.model";

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

export interface AdminProjectStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  archived: number;
  community: number;
  official: number;
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
  content?: {
    overview?: string;
    markdown?: string;
    previewImage?: string | null;
    requirements?: string[];
    checklist?: string[];
    bonusChallenges?: string[];
    suggestedTechStack?: string[];
  };
  origin?: AdminProjectOrigin;
  status?: AdminProjectStatus;
  adminNotes?: string;
}

/**
 * Update payload strictly omits submittedBy to guarantee that
 * the original author can never be overwritten by administrative updates.
 */
export interface UpdateAdminProjectPayload {
  title?: string;
  description?: string;
  difficulty?: AdminProjectDifficulty;
  roadmapIds?: string[];
  topics?: string[];
  skills?: string[];
  type?: string;
  content?: {
    overview?: string;
    markdown?: string;
    previewImage?: string | null;
    requirements?: string[];
    checklist?: string[];
    bonusChallenges?: string[];
    suggestedTechStack?: string[];
  };
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

export interface IRoadmapProjectAdminRepository {
  getAllProjects(
    filter?: AdminProjectFilter
  ): Promise<PaginatedAdminProjectsResult>;
  getProjectBySlug(slug: string): Promise<RoadmapProject | null>;
  getProjectById(id: string): Promise<RoadmapProject | null>;
  createProject(
    payload: CreateAdminProjectPayload,
    adminUserId?: string
  ): Promise<RoadmapProject>;
  updateProject(
    slugOrId: string,
    payload: UpdateAdminProjectPayload
  ): Promise<RoadmapProject | null>;
  moderateProject(
    slugOrId: string,
    payload: ModerateProjectPayload,
    adminUserId?: string
  ): Promise<RoadmapProject | null>;
  deleteProject(slugOrId: string): Promise<boolean>;
  getStats(): Promise<AdminProjectStats>;
}

export interface IRoadmapProjectAdminService {
  getAllProjects(
    filter?: AdminProjectFilter
  ): Promise<PaginatedAdminProjectsResult>;
  getProjectBySlugOrId(slugOrId: string): Promise<RoadmapProject>;
  createProject(
    payload: CreateAdminProjectPayload,
    adminUserId?: string
  ): Promise<RoadmapProject>;
  updateProject(
    slugOrId: string,
    payload: UpdateAdminProjectPayload
  ): Promise<RoadmapProject>;
  moderateProject(
    slugOrId: string,
    payload: ModerateProjectPayload,
    adminUserId?: string
  ): Promise<RoadmapProject>;
  deleteProject(slugOrId: string): Promise<boolean>;
  getStats(): Promise<AdminProjectStats>;
}

