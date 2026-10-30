export const revalidate = 86400; // Cache roadmaps list for 24 hours

import { Suspense } from "react";
import { getRoadmaps, getCategories } from "@/services/queries/resource.queries";
import { ResourcesClient } from "@/components/resources/overview/ResourcesClient";
import { ErrorDisplay } from "@/components/shared/StatusState";
import ResourcesPageSkeleton from "./ResourcesPageSkeleton";

export { resourcesHubMeta as metadata } from "@/meta/resources/static";

async function ResourcesData() {
  try {
    const [roadmaps, categories] = await Promise.all([
      getRoadmaps(),
      getCategories(),
    ]);
    return <ResourcesClient roadmaps={roadmaps} categories={categories} />;
  } catch (error) {

    return (
      <ErrorDisplay
        title="Failed to Load Roadmaps"
        message="We couldn't retrieve the developer roadmaps from the server. Please try again later."
      />
    );
  }
}

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={<ResourcesPageSkeleton />}>
        <ResourcesData />
      </Suspense>
    </div>
  );
}
