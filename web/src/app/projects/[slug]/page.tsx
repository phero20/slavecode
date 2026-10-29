export const dynamic = "force-dynamic";

import React, { Suspense, cache } from "react";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/services/queries/project.queries";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import ProjectDetailSkeleton from "./ProjectDetailSkeleton";

const getProject = cache(async (slug: string) => {
  try {
    return await getProjectBySlug(slug);
  } catch {
    return null;
  }
});

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    const formattedSlug = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      title: `${formattedSlug} - Developer Project | SlaveCode`,
      description: "Explore project specifications, requirements, and guides on SlaveCode.",
    };
  }

  return {
    title: `${project.title} - Developer Project | SlaveCode`,
    description:
      project.description ||
      `Build ${project.title} and master practical coding skills with real-world requirements on SlaveCode.`,
  };
}

async function ProjectData({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  const { slug } = await paramsPromise;
  const project = await getProject(slug);

  return (
    <ProjectDetailView
      slug={slug}
      initialProject={project || undefined}
    />
  );
}

export default async function ProjectDetailPage({ params }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={<ProjectDetailSkeleton />}>
        <ProjectData paramsPromise={params} />
      </Suspense>
    </div>
  );
}
