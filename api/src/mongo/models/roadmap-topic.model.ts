import { mongoose } from "../connection";

const ResourceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "official",
        "article",
        "video",
        "course",
        "roadmap",
        "book",
        "podcast",
        "opensource",
        "other",
      ],
      default: "article",
    },
  },
  { _id: false }
);

const RoadmapTopicSchema = new mongoose.Schema(
  {
    roadmapSlug: { type: String, required: true, index: true },
    nodeId: { type: String, required: true, index: true },
    topicSlug: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    resources: { type: [ResourceItemSchema], default: [] },
    content: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for instant point lookups on node click:
RoadmapTopicSchema.index({ roadmapSlug: 1, nodeId: 1 }, { unique: true });
RoadmapTopicSchema.index({ roadmapSlug: 1, topicSlug: 1 });

export type ResourceType =
  | "official"
  | "article"
  | "video"
  | "course"
  | "roadmap"
  | "book"
  | "podcast"
  | "opensource"
  | "other";

export type ResourceItem = {
  title: string;
  url: string;
  type: ResourceType;
};

export type RoadmapTopic = {
  id?: string;
  roadmapSlug: string;
  nodeId: string;
  topicSlug: string;
  title: string;
  description: string;
  resources: ResourceItem[];
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RoadmapTopicDocument = RoadmapTopic & mongoose.Document;

export const RoadmapTopicModel =
  mongoose.models.RoadmapTopic ||
  mongoose.model<RoadmapTopicDocument>("RoadmapTopic", RoadmapTopicSchema);
