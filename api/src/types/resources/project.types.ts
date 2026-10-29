import {
  type RoadmapProject,
  type ProjectDifficulty,
} from "../../mongo/models/roadmap-project.model";

export interface ProjectCategorySummary {
  id: string;
  title: string;
  count: number;
}

export type ProjectSortOption = "default" | "newest";

export interface GetProjectsFilter {
  roadmapSlug?: string;
  difficulty?: ProjectDifficulty;
  search?: string;
  topic?: string;
  limit?: number;
  skip?: number;
  sort?: ProjectSortOption;
}

export interface GetAllProjectsOptions {
  roadmapSlug?: string;
  difficulty?: string;
  search?: string;
  topic?: string;
  page?: number | string;
  limit?: number | string;
  sort?: ProjectSortOption;
}

export interface PaginatedProjectsResult {
  projects: RoadmapProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserProjectsResult {
  projects: RoadmapProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isOwner: boolean;
}

export interface GetUserProjectsOptions {
  status?: string;
  page?: number | string;
  limit?: number | string;
}

export interface CreateProjectServiceInput {
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
  userId: string;
}

export interface UpdateProjectServiceInput {
  title?: string;
  description?: string;
  difficulty?: ProjectDifficulty;
  roadmapIds?: string[];
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

export interface IRoadmapProjectRepository {
  getProjectsByRoadmap(
    roadmapSlug: string,
    difficulty?: ProjectDifficulty,
    sort?: ProjectSortOption,
  ): Promise<RoadmapProject[]>;
  getProjectBySlug(slug: string): Promise<RoadmapProject | null>;
  getAllProjects(filter?: GetProjectsFilter): Promise<{
    projects: RoadmapProject[];
    total: number;
  }>;
  getPopularProjects(limit?: number): Promise<RoadmapProject[]>;
  getProjectCategories(): Promise<ProjectCategorySummary[]>;
  createProject(data: Partial<RoadmapProject>): Promise<RoadmapProject>;
  updateProject(
    slug: string,
    data: Partial<RoadmapProject>,
  ): Promise<RoadmapProject | null>;
  deleteProject(slug: string): Promise<boolean>;
  existsBySlug(slug: string): Promise<boolean>;
  getUserProjects(
    userIds: string[],
    statusFilter?: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<{ projects: RoadmapProject[]; total: number }>;
}

export interface IRoadmapProjectService {
  getProjectsByRoadmap(
    roadmapSlug: string,
    difficulty?: string,
    sort?: ProjectSortOption,
  ): Promise<RoadmapProject[]>;
  getProjectBySlug(
    slug: string,
    requestingUserId?: string,
    userRole?: string,
    clerkUserId?: string,
  ): Promise<RoadmapProject>;
  getAllProjects(
    options?: GetAllProjectsOptions,
  ): Promise<PaginatedProjectsResult>;
  getPopularProjects(limit?: number): Promise<RoadmapProject[]>;
  getProjectCategories(): Promise<ProjectCategorySummary[]>;
  getUserProjects(
    username: string,
    requestingUserId?: string,
    clerkUserId?: string,
    options?: GetUserProjectsOptions,
  ): Promise<UserProjectsResult>;
  createProject(input: CreateProjectServiceInput): Promise<RoadmapProject>;
  updateProject(
    slug: string,
    input: UpdateProjectServiceInput,
    userId: string,
  ): Promise<RoadmapProject>;
  deleteProject(slug: string, userId: string): Promise<boolean>;
}
