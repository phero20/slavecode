import { mongoose } from "../connection";

export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";
export type ProjectOrigin = "official" | "community";
export type ProjectStatus = "pending" | "approved" | "rejected" | "archived" | "updated";

export interface IProjectContent {
  overview: string;
  markdown?: string;
  previewImage?: string | null;
  requirements: string[];
  checklist: string[];
  bonusChallenges?: string[];
  suggestedTechStack?: string[];
}

export interface IProjectSubmission {
  userId?: string | null;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  submittedAt?: Date | null;
}

export interface IProjectReview {
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}

export interface IProjectStats {
  startedCount: number;
  completedCount: number;
  upvotesCount: number;
}

export interface RoadmapProject {
  id?: string;
  slug: string;
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  roadmapIds: string[];
  topics: string[];
  skills: string[];
  order: number;
  type: string;
  content: IProjectContent;
  origin: ProjectOrigin;
  status: ProjectStatus;
  submittedBy?: IProjectSubmission;
  review?: IProjectReview;
  stats: IProjectStats;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectContentSchema = new mongoose.Schema(
  {
    overview: { type: String, default: "" },
    markdown: { type: String, default: "" },
    previewImage: { type: String, default: null },
    requirements: { type: [String], default: [] },
    checklist: { type: [String], default: [] },
    bonusChallenges: { type: [String], default: [] },
    suggestedTechStack: { type: [String], default: [] },
  },
  { _id: false }
);

const ProjectSubmissionSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    username: { type: String, default: null },
    fullName: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    submittedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ProjectReviewSchema = new mongoose.Schema(
  {
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    adminNotes: { type: String, default: null },
  },
  { _id: false }
);

const ProjectStatsSchema = new mongoose.Schema(
  {
    startedCount: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    upvotesCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const RoadmapProjectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },
    roadmapIds: [{ type: String, index: true }],
    topics: [{ type: String, default: [] }],
    skills: [{ type: String, default: [] }],
    order: { type: Number, default: 0 },
    type: { type: String, default: "code" },

    content: { type: ProjectContentSchema, default: () => ({}) },

    origin: {
      type: String,
      enum: ["official", "community"],
      default: "official",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived", "updated"],
      default: "approved",
      index: true,
    },

    submittedBy: { type: ProjectSubmissionSchema, default: null },
    review: { type: ProjectReviewSchema, default: null },
    stats: { type: ProjectStatsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for fast querying & moderation
RoadmapProjectSchema.index({ roadmapIds: 1, status: 1, order: 1 });
RoadmapProjectSchema.index({ difficulty: 1, status: 1 });
RoadmapProjectSchema.index({ "submittedBy.userId": 1, status: 1 });

export type RoadmapProjectDocument = RoadmapProject & mongoose.Document;

export const RoadmapProjectModel =
  mongoose.models.RoadmapProject ||
  mongoose.model<RoadmapProjectDocument>(
    "RoadmapProject",
    RoadmapProjectSchema
  );
