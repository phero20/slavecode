"use client";

import React, { useState } from "react";
import { ProjectForm } from "@/components/projects/form/ProjectForm";
import { ProjectSubmittedView } from "@/components/projects/ProjectSubmittedView";
import { useCreateProject } from "@/hooks/mutations/use-project.mutations";
import type { CreateProjectPayload, RoadmapProjectItem } from "@/types/project";

export default function CreateProjectPage() {
  const [submittedProject, setSubmittedProject] = useState<RoadmapProjectItem | null>(null);
  const createProjectMutation = useCreateProject();

  const handleCreate = async (data: CreateProjectPayload) => {
    const created = await createProjectMutation.mutateAsync(data);
    if (created?.slug) {
      setSubmittedProject(created);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-8">
      {submittedProject ? (
        <ProjectSubmittedView
          project={submittedProject}
          onReset={() => setSubmittedProject(null)}
        />
      ) : (
        <ProjectForm mode="create" onSubmit={handleCreate} />
      )}
    </main>
  );
}
