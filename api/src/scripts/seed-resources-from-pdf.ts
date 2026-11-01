import fs from "fs";
import path from "path";
import { connectMongo, mongoose } from "../mongo/connection";
import { RoadmapResourceModel } from "../mongo/models/roadmap-resource.model";

async function seed() {
  console.log("==================================================");
  console.log("SEEDING RESOURCES FROM TECH GUIDE PDF EXTRACT");
  console.log("==================================================");

  const previewPath = path.resolve(__dirname, "../../../data/extracted-resources-preview.json");
  if (!fs.existsSync(previewPath)) {
    throw new Error(`Extracted resources preview JSON not found at: ${previewPath}`);
  }

  const rawData = fs.readFileSync(previewPath, "utf8");
  const resources: Array<{
    title: string;
    url: string;
    type: string;
    author: string;
    description: string;
    roadmapIds: string[];
    origin: string;
    status: string;
    order?: number;
    stats?: { upvotesCount: number; viewsCount: number };
  }> = JSON.parse(rawData);

  console.log(`Loaded ${resources.length} resources from extracted-resources-preview.json`);

  console.log("Connecting to MongoDB Atlas...");
  await connectMongo();
  console.log("MongoDB connection established.");

  let insertedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  for (const item of resources) {
    const existing = await RoadmapResourceModel.findOne({ url: item.url });

    if (!existing) {
      // Insert new resource
      await RoadmapResourceModel.create({
        title: item.title,
        url: item.url,
        type: item.type || "Course",
        author: item.author || "",
        description: item.description || "",
        roadmapIds: item.roadmapIds || [],
        order: item.order ?? 0,
        origin: "official",
        status: "approved",
        submittedBy: null,
        review: null,
        stats: item.stats || { upvotesCount: 0, viewsCount: 0 },
      });
      insertedCount++;
    } else {
      // Merge roadmapIds and update metadata idempotently
      const updatedRoadmapIds = Array.from(
        new Set([...(existing.roadmapIds || []), ...(item.roadmapIds || [])])
      );

      const hasNewRoadmaps =
        updatedRoadmapIds.length !== (existing.roadmapIds?.length || 0);

      await RoadmapResourceModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            title: item.title || existing.title,
            type: item.type || existing.type,
            author: item.author || existing.author,
            description: item.description || existing.description,
            origin: "official",
            status: "approved",
            roadmapIds: updatedRoadmapIds,
          },
        }
      );

      if (hasNewRoadmaps) {
        updatedCount++;
      } else {
        unchangedCount++;
      }
    }
  }

  console.log("--------------------------------------------------");
  console.log(`Total Processed: ${resources.length}`);
  console.log(`Newly Inserted:  ${insertedCount}`);
  console.log(`Merged / Updated: ${updatedCount}`);
  console.log(`Already Present: ${unchangedCount}`);
  console.log("--------------------------------------------------");

  // Verify total count in DB
  const totalInDb = await RoadmapResourceModel.countDocuments();
  console.log(`Total Resources now in MongoDB: ${totalInDb}`);

  await mongoose.disconnect();
  console.log("MongoDB disconnected cleanly.");

  console.log("==================================================");
  console.log("SEED COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
  process.exit(0);
}

seed().catch((err) => {
  console.error("FATAL ERROR DURING RESOURCE SEEDING:", err);
  process.exit(1);
});
