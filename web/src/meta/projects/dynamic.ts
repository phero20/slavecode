import type { Metadata } from "next";
import { cache } from "react";
import { getProjectBySlug } from "@/services/queries/project.queries";

export const getCachedProject = cache(async (slug: string) => {
  return await getProjectBySlug(slug);
});

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateProjectMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const project = await getCachedProject(slug);

    if (!project) {
      const formattedSlug = titleFromSlug(slug);
      return {
        title: `${formattedSlug} Project`,
        description:
          "Explore project specifications, requirements, and guides on SlaveCode.",
        alternates: { canonical: `/projects/${slug}` },
      };
    }

    const description =
      project.description ||
      `Build ${project.title} and master practical coding skills with real-world requirements on SlaveCode.`;

    return {
      title: `${project.title} Project`,
      description,
      keywords: [
        project.title,
        "developer project",
        project.difficulty,
        ...(project.topics || []),
        "learn by building",
      ].filter(Boolean),
      alternates: { canonical: `/projects/${project.slug}` },
      openGraph: {
        title: `${project.title} | SlaveCode Projects`,
        description,
        type: "article",
        siteName: "SlaveCode",
      },
      twitter: {
        card: "summary_large_image",
        title: `${project.title} | SlaveCode Projects`,
        description,
      },
    };
  } catch (error) {
    console.error("METADATA GENERATION ERROR:", error);
    return {
      title: "Developer Project",
    };
  }
}
