export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import { getCachedProject } from "@/meta/projects/dynamic";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import ProjectDetailSkeleton from "./ProjectDetailSkeleton";

export { generateProjectMetadata as generateMetadata } from "@/meta/projects/dynamic";

const getProject = async (slug: string) => {
  try {
    return await getCachedProject(slug);
  } catch {
    return null;
  }
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
