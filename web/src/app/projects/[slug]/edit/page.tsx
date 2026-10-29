"use client";

import React, { use, useState } from "react";
import { ProjectForm } from "@/components/projects/form/ProjectForm";
import { ProjectSubmittedView } from "@/components/projects/ProjectSubmittedView";
import { useProjectDetailQuery } from "@/hooks/queries/use-project.queries";
import { useUpdateProject } from "@/hooks/mutations/use-project.mutations";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ProjectDetailSkeleton } from "@/components/skeletons/ProjectsSkeletons";
import type { CreateProjectPayload, RoadmapProjectItem } from "@/types/project";

interface EditProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = use(params);
  const [updatedProject, setUpdatedProject] = useState<RoadmapProjectItem | null>(null);

  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useProjectDetailQuery(slug);

  const updateProjectMutation = useUpdateProject(slug);

  const handleUpdate = async (data: CreateProjectPayload) => {
    const updated = await updateProjectMutation.mutateAsync(data);
    if (updated?.slug) {
      setUpdatedProject(updated);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-8">
      {updatedProject ? (
        <ProjectSubmittedView mode="update" project={updatedProject} />
      ) : (
      <QueryGuard
        loading={isLoading && !project}
        error={error}
        data={project}
        skeleton={
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <ProjectDetailSkeleton />
          </div>
        }
        onRetry={() => refetch()}
        errorTitle="Project Not Found"
        errorMessage="The project you want to edit could not be found."
      >
        {project && (
          <ProjectForm
            mode="edit"
            initialData={project}
            projectSlug={slug}
            onSubmit={handleUpdate}
          />
        )}
      </QueryGuard>
      )}
    </main>
  );
}
