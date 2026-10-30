export const revalidate = 86400; // Cache projects list for 24 hours

import { Suspense } from "react";
import {
  getProjectCategories,
  getProjects,
} from "@/services/queries/project.queries";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { ErrorDisplay } from "@/components/shared/StatusState";
import ProjectsPageSkeleton from "./ProjectsPageSkeleton";

export { projectsHubMeta as metadata } from "@/meta/projects/static";

async function ProjectsData() {
  try {
    const [categories, initialProjects] = await Promise.all([
      getProjectCategories(),
      getProjects({ limit: 18 }),
    ]);
    return (
      <ProjectsClient
        initialCategories={categories}
        initialProjects={initialProjects}
      />
    );
  } catch (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Projects"
        message="We couldn't retrieve the developer projects from the server. Please try again later."
      />
    );
  }
}

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={<ProjectsPageSkeleton />}>
        <ProjectsData />
      </Suspense>
    </div>
  );
}
