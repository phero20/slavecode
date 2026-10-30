export const revalidate = 86400; // Cache roadmap detail for 24 hours

import React, { Suspense } from "react";
import { getCachedResourceRoadmap } from "@/meta/resources/dynamic";
import { RoadmapDetailClient } from "@/components/resources/detail/RoadmapDetailClient";
import { ErrorDisplay } from "@/components/shared/StatusState";
import RoadmapDetailSkeleton from "./RoadmapDetailSkeleton";

export { generateResourceRoadmapMetadata as generateMetadata } from "@/meta/resources/dynamic";

const getRoadmap = async (slug: string) => {
  try {
    return await getCachedResourceRoadmap(slug);
  } catch {
    return null;
  }
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ r?: string; tab?: string }>;
};

async function RoadmapData({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
  searchParamsPromise?: Promise<{ r?: string; tab?: string }>;
}) {
  const { slug } = await paramsPromise;
  const searchParams = searchParamsPromise ? await searchParamsPromise : undefined;
  const targetSlug = searchParams?.r || slug;
  const roadmap = await getRoadmap(targetSlug);

  if (!roadmap) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6">
        <ErrorDisplay
          title="Roadmap Not Found"
          message={`We couldn't locate a roadmap matching "${targetSlug}". Please check the URL or explore our other available developer roadmaps.`}
        />
      </div>
    );
  }

  return <RoadmapDetailClient roadmap={roadmap} />;
}

export default function RoadmapPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<RoadmapDetailSkeleton />}>
      <RoadmapData paramsPromise={params} searchParamsPromise={searchParams} />
    </Suspense>
  );
}
