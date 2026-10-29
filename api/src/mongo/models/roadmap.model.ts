import { mongoose } from "../connection";

const RoadmapTitleSchema = new mongoose.Schema(
  {
    card: { type: String, required: true },
    page: { type: String, required: true },
  },
  { _id: false }
);

const RoadmapDimensionsSchema = new mongoose.Schema(
  {
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const RoadmapSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: RoadmapTitleSchema, required: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["role", "skill"],
      default: "skill",
      index: true,
    },
    categories: [{ type: String, index: true }],
    nodesCount: { type: Number, default: 0 },
    nodes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    edges: { type: [mongoose.Schema.Types.Mixed], default: [] },
    dimensions: { type: RoadmapDimensionsSchema },
    relatedRoadmaps: { type: [String], default: [] },
    seo: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, default: "published" },
  },
  {
    timestamps: true,
  }
);

// Index for rapid sorting and filtering
RoadmapSchema.index({ type: 1, "title.card": 1 });


export type RoadmapTitle = {
  card: string;
  page: string;
};

export type Roadmap = {
  id?: string;
  slug: string;
  title: RoadmapTitle;
  description: string;
  type: "role" | "skill";
  categories: string[];
  nodesCount: number;
  nodes: any[];
  edges?: any[];
  dimensions?: { width: number; height: number };
  relatedRoadmaps?: string[];
  seo?: Record<string, any>;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RoadmapDocument = Roadmap & mongoose.Document;

export const RoadmapModel =
  mongoose.models.Roadmap ||
  mongoose.model<RoadmapDocument>("Roadmap", RoadmapSchema);
