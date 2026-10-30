import type { Metadata } from "next";
import { cache } from "react";
import { getRoadmapBySlug } from "@/services/queries/resource.queries";

export const getCachedResourceRoadmap = cache(async (slug: string) => {
  return await getRoadmapBySlug(slug);
});

export async function generateResourceRoadmapMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ r?: string; tab?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const targetSlug = sp?.r || slug;

  try {
    const roadmap = await getCachedResourceRoadmap(targetSlug);
    if (!roadmap) {
      return {
        title: "Roadmap Not Found",
        description: "The requested developer roadmap could not be found.",
      };
    }

    const title = roadmap.title?.page || roadmap.title?.card || roadmap.slug;
    const currentYear = new Date().getFullYear().toString();
    const cleanDescription = (roadmap.description || "")
      .replace(/@currentYear@/g, currentYear)
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .substring(0, 160)
      .trim();
    const description =
      cleanDescription ||
      `Interactive ${title} developer roadmap with step-by-step career milestones.`;

    return {
      title: `${title} Roadmap`,
      description,
      keywords: [
        `${title} roadmap`,
        "developer roadmap",
        "career path",
        "learn to code",
        "coding resources",
      ],
      alternates: { canonical: `/resources/${roadmap.slug || targetSlug}` },
      openGraph: {
        title: `${title} Roadmap | SlaveCode`,
        description,
        type: "article",
        siteName: "SlaveCode",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} Roadmap | SlaveCode`,
        description,
      },
    };
  } catch (error) {
    console.error("METADATA GENERATION ERROR:", error);
    return {
      title: "Developer Roadmap",
    };
  }
}
