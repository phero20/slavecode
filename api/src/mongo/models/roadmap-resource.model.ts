import { mongoose } from "../connection";

export type ResourceOrigin = "official" | "community";
export type ResourceStatus = "pending" | "approved" | "rejected" | "archived";

export interface IResourceSubmission {
  userId?: string | null;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  submittedAt?: Date | null;
}

export interface IResourceReview {
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}

export interface IResourceStats {
  upvotesCount: number;
  viewsCount: number;
}

export interface RoadmapResource {
  id?: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string | null;
  type: string; // Free-form string (e.g., "YouTube Playlist", "Video", "Documentation", "Course", "Article")
  author?: string; // Channel name, author, or platform (e.g., "FreeCodeCamp", "Traversy Media")
  roadmapIds: string[]; // Associated roadmap slugs/ids (e.g., ["full-stack", "backend"])
  order: number;
  origin: ResourceOrigin;
  status: ResourceStatus;
  submittedBy?: IResourceSubmission;
  review?: IResourceReview;
  stats: IResourceStats;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSubmissionSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    username: { type: String, default: null },
    fullName: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    submittedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ResourceReviewSchema = new mongoose.Schema(
  {
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    adminNotes: { type: String, default: null },
  },
  { _id: false }
);

const ResourceStatsSchema = new mongoose.Schema(
  {
    upvotesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const RoadmapResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    url: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, default: null },
    type: { type: String, required: true, trim: true, default: "Resource" },
    author: { type: String, default: "" },
    roadmapIds: [{ type: String, index: true }],
    order: { type: Number, default: 0 },

    origin: {
      type: String,
      enum: ["official", "community"],
      default: "community",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived"],
      default: "pending",
      index: true,
    },

    submittedBy: { type: ResourceSubmissionSchema, default: null },
    review: { type: ResourceReviewSchema, default: null },
    stats: { type: ResourceStatsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying & admin moderation
RoadmapResourceSchema.index({ roadmapIds: 1, status: 1, order: 1 });
RoadmapResourceSchema.index({ status: 1, createdAt: -1 });
RoadmapResourceSchema.index({ "submittedBy.userId": 1, status: 1 });

export type RoadmapResourceDocument = RoadmapResource & mongoose.Document;

export const RoadmapResourceModel =
  mongoose.models.RoadmapResource ||
  mongoose.model<RoadmapResourceDocument>(
    "RoadmapResource",
    RoadmapResourceSchema
  );

