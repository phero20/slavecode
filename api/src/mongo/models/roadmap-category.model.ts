import { mongoose } from "../connection";

const RoadmapItemRefSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true },
  },
  { _id: false }
);

const RoadmapCategorySectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    roadmaps: { type: [RoadmapItemRefSchema], default: [] },
  },
  { _id: false }
);

const RoadmapCategorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    count: { type: Number, default: 0 },
    order: { type: Number, default: 0, index: true },
    sections: { type: [RoadmapCategorySectionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);


export type RoadmapItemRef = {
  slug: string;
  title: string;
};

export type RoadmapCategorySection = {
  heading: string;
  roadmaps: RoadmapItemRef[];
};

export type RoadmapCategory = {
  id?: string;
  categoryId: string;
  title: string;
  count: number;
  order: number;
  sections: RoadmapCategorySection[];
  createdAt: Date;
  updatedAt: Date;
};

export type RoadmapCategoryDocument = RoadmapCategory & mongoose.Document;

export const RoadmapCategoryModel =
  mongoose.models.RoadmapCategory ||
  mongoose.model<RoadmapCategoryDocument>("RoadmapCategory", RoadmapCategorySchema);
