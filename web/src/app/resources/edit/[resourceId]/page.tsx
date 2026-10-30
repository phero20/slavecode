"use client";

import React, { use, useState } from "react";
import { ResourceForm } from "@/components/resources/form/ResourceForm";
import { ResourceSubmittedView } from "@/components/resources/ResourceSubmittedView";
import { useResourceDetailQuery } from "@/hooks/queries/use-roadmap-resource.queries";
import { useUpdateResource } from "@/hooks/mutations/use-roadmap-resource.mutations";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ResourceCardSkeleton } from "@/components/skeletons/ResourcesSkeletons";
import type {
  CreateRoadmapResourcePayload,
  RoadmapResourceItem,
} from "@/types/roadmap-resource";

interface EditResourcePageProps {
  params: Promise<{ resourceId: string }>;
}

export default function EditResourcePage({ params }: EditResourcePageProps) {
  const { resourceId } = use(params);
  const [updatedResource, setUpdatedResource] =
    useState<RoadmapResourceItem | null>(null);

  const {
    data: resource,
    isLoading,
    error,
    refetch,
  } = useResourceDetailQuery(resourceId);

  const updateResourceMutation = useUpdateResource(resourceId);

  const handleUpdate = async (data: CreateRoadmapResourcePayload) => {
    const updated = await updateResourceMutation.mutateAsync(data);
    if (updated) {
      setUpdatedResource(updated);
    }
  };

  const initialData: Partial<CreateRoadmapResourcePayload> | undefined =
    resource
      ? {
          title: resource.title,
          description: resource.description,
          url: resource.url,
          thumbnailUrl: resource.thumbnailUrl,
          type: resource.type,
          author: resource.author,
          roadmapIds: resource.roadmapIds,
        }
      : undefined;

  return (
    <main className="min-h-screen bg-background text-foreground py-8">
      {updatedResource ? (
        <ResourceSubmittedView mode="update" resource={updatedResource} />
      ) : (
        <QueryGuard
          loading={isLoading && !resource}
          error={error}
          data={resource}
          skeleton={
            <div className="w-full max-w-4xl mx-auto px-4 py-8">
              <ResourceCardSkeleton />
            </div>
          }
          onRetry={() => refetch()}
          errorTitle="Resource Not Found"
          errorMessage="The resource you want to edit could not be found."
        >
          {resource && (
            <ResourceForm
              mode="edit"
              initialData={initialData}
              onSubmit={handleUpdate}
            />
          )}
        </QueryGuard>
      )}
    </main>
  );
}
