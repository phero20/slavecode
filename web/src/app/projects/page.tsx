export const revalidate = 86400; // Cache projects list for 24 hours

import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getProjectCategories,
  getProjects,
} from "@/services/queries/project.queries";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { ErrorDisplay } from "@/components/shared/StatusState";
import ProjectsPageSkeleton from "./ProjectsPageSkeleton";

export const metadata: Metadata = {
  title: "Explore Developer Projects | SlaveCode Projects",
  description:
    "Explore 112+ curated developer projects across Frontend, Backend, DevOps, AI, Python, Node.js, and more to build your portfolio and master your craft.",
};

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
