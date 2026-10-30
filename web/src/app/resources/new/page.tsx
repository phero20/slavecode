"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResourceForm } from "@/components/resources/form/ResourceForm";
import { ResourceSubmittedView } from "@/components/resources/ResourceSubmittedView";
import { useCreateResource } from "@/hooks/mutations/use-roadmap-resource.mutations";
import type {
  CreateRoadmapResourcePayload,
  RoadmapResourceItem,
} from "@/types/roadmap-resource";

function CreateResourcePageInner() {
  const searchParams = useSearchParams();
  const defaultRoadmap = searchParams.get("roadmap")?.trim() || "";
  const [submittedResource, setSubmittedResource] =
    useState<RoadmapResourceItem | null>(null);
  const createResourceMutation = useCreateResource();

  const handleCreate = async (data: CreateRoadmapResourcePayload) => {
    const created = await createResourceMutation.mutateAsync(data);
    if (created) {
      setSubmittedResource(created);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-8">
      {submittedResource ? (
        <ResourceSubmittedView
          resource={submittedResource}
          onReset={() => setSubmittedResource(null)}
        />
      ) : (
        <ResourceForm
          mode="create"
          initialRoadmapIds={defaultRoadmap ? [defaultRoadmap] : undefined}
          onSubmit={handleCreate}
        />
      )}
    </main>
  );
}

export default function CreateResourcePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background text-foreground py-8" />
      }
    >
      <CreateResourcePageInner />
    </Suspense>
  );
}
