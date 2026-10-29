import fs from "fs";
import path from "path";
import { connectMongo, mongoose } from "../mongo/connection";
import { RoadmapModel } from "../mongo/models/roadmap.model";

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await connectMongo();
  console.log("MongoDB connection established.");

  const roadmapsDir = path.resolve(__dirname, "../../../data/roadmaps");
  if (!fs.existsSync(roadmapsDir)) {
    throw new Error(`Roadmaps directory not found at: ${roadmapsDir}`);
  }

  const files = fs
    .readdirSync(roadmapsDir)
    .filter((f) => f.endsWith(".json"));

  console.log(`Found ${files.length} roadmap JSON definitions in data/roadmaps.`);

  let updatedCount = 0;
  let insertedCount = 0;

  for (const file of files) {
    const filePath = path.join(roadmapsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const slug = data.slug || file.replace(".json", "");
    const title = {
      card: data.title?.card || data.title?.page || slug,
      page: data.title?.page || data.title?.card || slug,
    };
    const description = data.description || "";
    const type = data.type === "role" ? "role" : "skill";
    const categories = Array.isArray(data.categories) ? data.categories : [];
    const nodes = Array.isArray(data.nodes) ? data.nodes : [];
    const edges = Array.isArray(data.edges) ? data.edges : [];
    const nodesCount = nodes.length;
    const dimensions = data.dimensions || undefined;
    const relatedRoadmaps = Array.isArray(data.relatedRoadmaps)
      ? data.relatedRoadmaps
      : [];
    const seo = data.seo || undefined;

    const res = await RoadmapModel.updateOne(
      { slug },
      {
        $set: {
          slug,
          title,
          description,
          type,
          categories,
          nodes,
          edges,
          nodesCount,
          dimensions,
          relatedRoadmaps,
          seo,
          status: "published",
        },
      },
      { upsert: true }
    );

    if (res.upsertedCount > 0) {
      insertedCount++;
    } else {
      updatedCount++;
    }
  }

  console.log("==========================================");
  console.log(`DATABASE SEED COMPLETED!`);
  console.log(`Total Roadmaps: ${files.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Inserted: ${insertedCount}`);
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed roadmaps:", err);
  process.exit(1);
});
