export const revalidate = 86400; // Cache roadmap detail for 24 hours

import React, { Suspense, cache } from "react";
import type { Metadata } from "next";
import { getRoadmapBySlug } from "@/services/queries/resource.queries";
import { RoadmapDetailClient } from "@/components/resources/detail/RoadmapDetailClient";
import { ErrorDisplay } from "@/components/shared/StatusState";
import RoadmapDetailSkeleton from "./RoadmapDetailSkeleton";

const getRoadmap = cache(async (slug: string) => {
  try {
    return await getRoadmapBySlug(slug);
  } catch (error) {
    return null;
  }
});

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ r?: string; tab?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const targetSlug = sp?.r || slug;
  const roadmap = await getRoadmap(targetSlug);

  if (!roadmap) {
    return {
      title: "Roadmap Not Found | SlaveCode Resources",
      description: "The requested developer roadmap could not be found.",
    };
  }

  const title = roadmap.title?.page || roadmap.title?.card || roadmap.slug;
  const currentYear = new Date().getFullYear().toString();
  const description = (roadmap.description || "").replace(
    /@currentYear@/g,
    currentYear
  );

  return {
    title: `${title} Roadmap | SlaveCode Resources`,
    description:
      description ||
      `Interactive ${title} developer roadmap with step-by-step career milestones.`,
  };
}

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
