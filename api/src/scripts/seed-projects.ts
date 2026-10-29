import fs from "fs";
import path from "path";
import { connectMongo, mongoose } from "../mongo/connection";
import {
  RoadmapProjectModel,
  ProjectDifficulty,
} from "../mongo/models/roadmap-project.model";

/**
 * Turbo-stream decoder for React Router v7 / Remix single-fetch payloads
 */
export function decodeTurboStream(raw: any[]): any {
  if (!Array.isArray(raw)) return raw;

  function resolve(val: any, seen = new Set<number>()): any {
    if (typeof val === "number") {
      if (val === -5) return undefined;
      if (val === -7) return null;
      if (val < 0 || val >= raw.length) return val;
      if (seen.has(val)) return `[Circular:${val}]`;
      seen.add(val);
      const res = resolve(raw[val], seen);
      seen.delete(val);
      return res;
    }
    if (Array.isArray(val)) {
      return val.map((x) => resolve(x, new Set(seen)));
    }
    if (val && typeof val === "object") {
      const obj: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        if (k.startsWith("_")) {
          const propIndex = parseInt(k.slice(1), 10);
          const propName = raw[propIndex];
          obj[propName] = resolve(v, new Set(seen));
        } else {
          obj[k] = resolve(v, new Set(seen));
        }
      }
      return obj;
    }
    return val;
  }

  return resolve(0);
}

/**
 * Convert ProseMirror AST node into clean markdown
 */
export function proseMirrorToMarkdown(node: any): string {
  if (!node) return "";

  if (node.type === "text") {
    let text = node.text || "";
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold" || mark.type === "strong") text = `**${text}**`;
        else if (mark.type === "italic" || mark.type === "em") text = `*${text}*`;
        else if (mark.type === "code") text = `\`${text}\``;
        else if (mark.type === "link" && mark.attrs?.href) text = `[${text}](${mark.attrs.href})`;
      }
    }
    return text;
  }

  const innerText = (node.content || [])
    .map((c: any) => proseMirrorToMarkdown(c))
    .join("");

  switch (node.type) {
    case "doc":
      return (node.content || [])
        .map((c: any) => proseMirrorToMarkdown(c))
        .join("\n\n");
    case "paragraph":
      return innerText;
    case "heading": {
      const level = node.attrs?.level || 2;
      return `${"#".repeat(level)} ${innerText}`;
    }
    case "blockquote":
      return innerText
        .split("\n")
        .map((line: string) => `> ${line}`)
        .join("\n");
    case "bulletList":
      return (node.content || [])
        .map((li: any) => `- ${proseMirrorToMarkdown(li).trim()}`)
        .join("\n");
    case "orderedList":
      return (node.content || [])
        .map(
          (li: any, idx: number) =>
            `${idx + 1}. ${proseMirrorToMarkdown(li).trim()}`
        )
        .join("\n");
    case "listItem":
      return innerText;
    case "image":
      return `![${node.attrs?.alt || "Project Preview"}](${node.attrs?.src})`;
    case "horizontalRule":
      return "---";
    case "codeBlock":
      return `\`\`\`${node.attrs?.language || ""}\n${innerText}\n\`\`\``;
    default:
      return innerText;
  }
}

/**
 * Extract structured sections (overview, preview image, requirements, checklist) from ProseMirror doc AST
 */
export function extractProjectSections(doc: any) {
  let previewImage: string | null = null;
  const requirements: string[] = [];
  const checklist: string[] = [];
  let overview = "";

  if (!doc || !Array.isArray(doc.content)) {
    return { overview, previewImage, requirements, checklist, markdown: "" };
  }

  let currentSection: "overview" | "requirements" | "checklist" | "other" =
    "overview";

  for (const node of doc.content) {
    // Extract first preview image
    if (node.type === "image" && node.attrs?.src) {
      if (!previewImage) previewImage = node.attrs.src;
    }

    // Identify headings
    if (node.type === "heading") {
      const headingText = (node.content || [])
        .map((c: any) => c.text || "")
        .join("")
        .toLowerCase();
      if (
        headingText.includes("requirement") ||
        headingText.includes("feature")
      ) {
        currentSection = "requirements";
      } else if (
        headingText.includes("checklist") ||
        headingText.includes("submission")
      ) {
        currentSection = "checklist";
      } else {
        currentSection = "other";
      }
      continue;
    }

    // Blockquote usually contains the main project goal/overview
    if (node.type === "blockquote") {
      const bqText = proseMirrorToMarkdown(node).replace(/^>\s*/gm, "").trim();
      if (!overview) overview = bqText;
    }

    // Collect lists into requirements or checklist
    if (node.type === "bulletList" || node.type === "orderedList") {
      const items = (node.content || [])
        .map((li: any) => proseMirrorToMarkdown(li).trim())
        .filter(Boolean);
      if (currentSection === "requirements") {
        requirements.push(...items);
      } else if (currentSection === "checklist") {
        checklist.push(...items);
      } else if (!requirements.length) {
        requirements.push(...items);
      }
    }
  }

  // Fallback to first non-image paragraph for overview if no blockquote was present
  if (!overview) {
    for (const node of doc.content) {
      if (node.type === "paragraph") {
        const pText = proseMirrorToMarkdown(node).trim();
        if (pText && !pText.startsWith("![")) {
          overview = pText;
          break;
        }
      }
    }
  }

  return {
    overview,
    previewImage,
    requirements,
    checklist,
    markdown: proseMirrorToMarkdown(doc),
  };
}

// Simple batch runner with concurrency limit
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<any>[] = [];

  for (let i = 0; i < items.length; i++) {
    const p = fn(items[i], i).then((res) => {
      results[i] = res;
    });
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      // Remove settled promises
      for (let j = executing.length - 1; j >= 0; j--) {
        // @ts-ignore
        if (executing[j].isSettled) {
          executing.splice(j, 1);
        }
      }
    }
  }

  await Promise.all(executing);
  return results;
}

async function seed() {
  const args = process.argv.slice(2);
  const diskOnly = args.includes("--disk-only");
  const force = args.includes("--force");

  console.log("==========================================");
  console.log("ROADMAP PROJECTS SEEDER");
  console.log("==========================================");

  const projectsDir = path.resolve(__dirname, "../../../data/projects");
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
    console.log(`Created projects directory at: ${projectsDir}`);
  }

  // 1. Fetch the Roadmap.sh Projects Catalog
  console.log("Fetching projects catalog from https://roadmap.sh/projects.data ...");
  const catalogRes = await fetch("https://roadmap.sh/projects.data");
  if (!catalogRes.ok) {
    throw new Error(
      `Failed to fetch projects catalog: HTTP ${catalogRes.status} ${catalogRes.statusText}`
    );
  }

  const catalogRaw = await catalogRes.json();
  const catalogRoot = decodeTurboStream(catalogRaw);

  const roadmapsWithProjects: any[] =
    catalogRoot["routes/projects._index"]?.data?.roadmaps ||
    catalogRoot["routes/projects"]?.data?.roadmaps ||
    [];

  console.log(
    `Found ${roadmapsWithProjects.length} roadmaps in projects catalog.`
  );

  // Map unique projects and collect all mapped roadmap slugs
  const projectMap = new Map<string, any>();
  const roadmapProjectSlugs: Record<string, string[]> = {};

  for (const r of roadmapsWithProjects) {
    const roadmapSlug = r.id;
    if (!roadmapSlug) continue;

    const projects = Array.isArray(r.projects) ? r.projects : [];
    roadmapProjectSlugs[roadmapSlug] = [];

    for (const p of projects) {
      if (!p || !p.slug) continue;
      roadmapProjectSlugs[roadmapSlug].push(p.slug);

      if (!projectMap.has(p.slug)) {
        projectMap.set(p.slug, {
          ...p,
          roadmapIds: [roadmapSlug],
        });
      } else {
        const existing = projectMap.get(p.slug);
        if (!existing.roadmapIds.includes(roadmapSlug)) {
          existing.roadmapIds.push(roadmapSlug);
        }
      }
    }
  }

  const uniqueProjects = Array.from(projectMap.values());
  console.log(`Found ${uniqueProjects.length} unique projects to process.\n`);

  // 2. Fetch Detailed Content for each Project and save to disk
  let savedDiskCount = 0;
  let skippedDiskCount = 0;
  const processedProjects: any[] = [];

  const CONCURRENCY_LIMIT = 5;

  await runWithConcurrency(uniqueProjects, CONCURRENCY_LIMIT, async (summary, idx) => {
    const slug = summary.slug;
    const filePath = path.join(projectsDir, `${slug}.json`);

    // If file already exists and not forcing re-fetch
    if (fs.existsSync(filePath) && !force) {
      try {
        const cached = JSON.parse(fs.readFileSync(filePath, "utf8"));
        if (cached && cached.content && cached.content.overview) {
          skippedDiskCount++;
          processedProjects.push(cached);
          process.stdout.write(
            `\r[${idx + 1}/${uniqueProjects.length}] (Cached) ${slug}`
          );
          return;
        }
      } catch (e) {
        // If file is corrupt, refetch
      }
    }

    try {
      const detailRes = await fetch(
        `https://roadmap.sh/projects/${slug}.data`
      );
      if (!detailRes.ok) {
        console.warn(`\nFailed to fetch detail for ${slug}: HTTP ${detailRes.status}`);
        return;
      }

      const detailRaw = await detailRes.json();
      const detailRoot = decodeTurboStream(detailRaw);

      let detailProj: any = null;
      for (const k of Object.keys(detailRoot)) {
        if (detailRoot[k]?.data?.project) {
          detailProj = detailRoot[k].data.project;
          break;
        }
      }

      const sections = detailProj?.content
        ? extractProjectSections(detailProj.content)
        : {
            overview: summary.description || "",
            previewImage: null,
            requirements: [],
            checklist: [],
            markdown: "",
          };

      const finalProject = {
        _id: detailProj?._id || summary._id,
        slug: summary.slug,
        title: summary.title || detailProj?.title || slug,
        description: summary.description || detailProj?.description || "",
        difficulty: (summary.difficulty || detailProj?.difficulty || "beginner") as ProjectDifficulty,
        roadmapIds: summary.roadmapIds || detailProj?.roadmapIds || [],
        topics: summary.topics || detailProj?.topics || [],
        skills: summary.skills || detailProj?.skills || [],
        order: summary.order ?? detailProj?.order ?? idx * 10,
        type: summary.type || detailProj?.type || "code",
        origin: "official",
        status: "approved",
        content: {
          overview: sections.overview || summary.description || "",
          previewImage: sections.previewImage || null,
          requirements: sections.requirements || [],
          checklist: sections.checklist || [],
          bonusChallenges: [],
          suggestedTechStack: summary.topics || [],
        },
        stats: {
          startedCount: 0,
          completedCount: 0,
          upvotesCount: 0,
        },
        createdAt: detailProj?.createdAt || detailProj?.publishedAt || new Date().toISOString(),
        updatedAt: detailProj?.updatedAt || new Date().toISOString(),
      };

      fs.writeFileSync(filePath, JSON.stringify(finalProject, null, 2), "utf8");
      savedDiskCount++;
      processedProjects.push(finalProject);
      process.stdout.write(
        `\r[${idx + 1}/${uniqueProjects.length}] Saved ${slug}`
      );
    } catch (err: any) {
      console.warn(`\nError processing project ${slug}: ${err.message}`);
    }
  });

  console.log("\n");

  // Save the complete catalog index file to data/projects-catalog.json
  const catalogIndexPath = path.resolve(
    __dirname,
    "../../../data/projects-catalog.json"
  );
  fs.writeFileSync(
    catalogIndexPath,
    JSON.stringify(
      {
        totalProjects: processedProjects.length,
        totalRoadmapsWithProjects: Object.keys(roadmapProjectSlugs).length,
        roadmapMapping: roadmapProjectSlugs,
        projects: processedProjects.map((p) => ({
          slug: p.slug,
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          roadmapIds: p.roadmapIds,
          topics: p.topics,
          skills: p.skills,
        })),
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(`Saved projects catalog index to: ${catalogIndexPath}`);

  console.log("==========================================");
  console.log(`DISK CACHE COMPLETED!`);
  console.log(`Total Unique Projects: ${processedProjects.length}`);
  console.log(`Newly Saved: ${savedDiskCount}`);
  console.log(`Cached / Reused: ${skippedDiskCount}`);
  console.log(`Location: data/projects/*.json`);
  console.log("==========================================");

  // 3. Database Upsert (if not --disk-only)
  if (!diskOnly) {
    console.log("\nConnecting to MongoDB Atlas to seed projects...");
    try {
      await connectMongo();
      console.log("MongoDB connection established.");

      let dbUpserted = 0;
      let dbModified = 0;

      for (const p of processedProjects) {
        const res = await RoadmapProjectModel.updateOne(
          { slug: p.slug },
          {
            $set: {
              slug: p.slug,
              title: p.title,
              description: p.description,
              difficulty: p.difficulty,
              roadmapIds: p.roadmapIds,
              topics: p.topics,
              skills: p.skills,
              order: p.order,
              type: p.type,
              origin: p.origin,
              status: p.status,
              content: p.content,
              stats: p.stats,
            },
          },
          { upsert: true }
        );

        if (res.upsertedCount > 0) dbUpserted++;
        else dbModified++;
      }

      console.log("==========================================");
      console.log(`MONGODB ATLAS SEED COMPLETED!`);
      console.log(`Inserted: ${dbUpserted}`);
      console.log(`Updated: ${dbModified}`);
      console.log("==========================================");

      await mongoose.disconnect();
    } catch (err: any) {
      console.error("Failed to connect or seed MongoDB:", err.message);
      console.log("Note: Projects are safely cached in data/projects/*.json.");
    }
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Fatal error during projects seed:", err);
  process.exit(1);
});
