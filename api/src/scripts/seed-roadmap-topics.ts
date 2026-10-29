import fs from "fs";
import path from "path";
import { connectMongo, mongoose } from "../mongo/connection";
import {
  RoadmapTopicModel,
  ResourceItem,
  ResourceType,
} from "../mongo/models/roadmap-topic.model";

const VALID_RESOURCE_TYPES: Set<string> = new Set([
  "official",
  "article",
  "video",
  "course",
  "roadmap",
  "book",
  "podcast",
  "opensource",
]);

function parseTopicMarkdown(raw: string) {
  // Extract title: first # Heading
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract resources: - [@type@Title](url) or - [Title](url)
  const resources: ResourceItem[] = [];
  const linkRegex = /-\s+\[(?:@([a-zA-Z0-9_-]+)@)?([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(raw)) !== null) {
    const rawType = (match[1] || "article").toLowerCase();
    const cleanType: ResourceType = VALID_RESOURCE_TYPES.has(rawType)
      ? (rawType as ResourceType)
      : "other";

    resources.push({
      type: cleanType,
      title: match[2].trim(),
      url: match[3].trim(),
    });
  }

  // Extract clean description: text between title and resources
  let description = raw;
  if (titleMatch) {
    description = description.replace(titleMatch[0], "").trim();
  }
  const resourceCutoff = description.search(
    /(?:Visit the following resources to learn more:?)|(?:-\s+\[(?:@[a-zA-Z0-9_-]+@)?)/i
  );
  if (resourceCutoff !== -1) {
    description = description.slice(0, resourceCutoff).trim();
  }

  return {
    title,
    description,
    resources,
    content: raw,
  };
}

async function seed() {
  console.log("==========================================");
  console.log("Connecting to MongoDB Atlas...");
  await connectMongo();
  console.log("MongoDB connection established.");

  const contentBaseDir = path.resolve(
    __dirname,
    "../../../data/roadmaps-content"
  );
  if (!fs.existsSync(contentBaseDir)) {
    throw new Error(
      `Roadmaps content directory not found at: ${contentBaseDir}`
    );
  }

  const roadmapFolders = fs
    .readdirSync(contentBaseDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log(
    `Found ${roadmapFolders.length} roadmap folders in data/roadmaps-content.`
  );

  const BATCH_SIZE = 500;
  let batchOps: any[] = [];
  let totalTopics = 0;
  let totalUpserted = 0;
  let totalModified = 0;

  for (let i = 0; i < roadmapFolders.length; i++) {
    const roadmapSlug = roadmapFolders[i];
    const roadmapDir = path.join(contentBaseDir, roadmapSlug);

    // Some folders may have direct markdown files or a "content" subfolder
    let targetContentDir = roadmapDir;
    const subContentDir = path.join(roadmapDir, "content");
    if (fs.existsSync(subContentDir)) {
      targetContentDir = subContentDir;
    }

    const files = fs
      .readdirSync(targetContentDir)
      .filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const base = file.replace(/\.md$/, "");
      const lastAtIndex = base.lastIndexOf("@");
      if (lastAtIndex === -1) {
        // Skip files that do not have node ID format (e.g. readme.md)
        continue;
      }

      const topicSlug = base.slice(0, lastAtIndex);
      const nodeId = base.slice(lastAtIndex + 1);
      const filePath = path.join(targetContentDir, file);
      const rawContent = fs.readFileSync(filePath, "utf8");

      const parsed = parseTopicMarkdown(rawContent);
      const title = parsed.title || topicSlug.replace(/-/g, " ");

      batchOps.push({
        updateOne: {
          filter: { roadmapSlug, nodeId },
          update: {
            $set: {
              roadmapSlug,
              nodeId,
              topicSlug,
              title,
              description: parsed.description,
              resources: parsed.resources,
              content: parsed.content,
            },
          },
          upsert: true,
        },
      });

      totalTopics++;

      if (batchOps.length >= BATCH_SIZE) {
        const res = await RoadmapTopicModel.bulkWrite(batchOps, {
          ordered: false,
        });
        totalUpserted += res.upsertedCount || 0;
        totalModified += res.modifiedCount || 0;
        batchOps = [];
        process.stdout.write(
          `\rProcessed ${totalTopics} topics... (Roadmap ${i + 1}/${
            roadmapFolders.length
          }: ${roadmapSlug})`
        );
      }
    }
  }

  // Flush remaining batch operations
  if (batchOps.length > 0) {
    const res = await RoadmapTopicModel.bulkWrite(batchOps, {
      ordered: false,
    });
    totalUpserted += res.upsertedCount || 0;
    totalModified += res.modifiedCount || 0;
  }

  console.log("\n==========================================");
  console.log("ROADMAP TOPICS SEED COMPLETED!");
  console.log(`Total Roadmaps Scanned: ${roadmapFolders.length}`);
  console.log(`Total Topic Guides Processed: ${totalTopics}`);
  console.log(`Upserted (New): ${totalUpserted}`);
  console.log(`Updated (Existing): ${totalModified}`);
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed roadmap topics:", err);
  process.exit(1);
});
