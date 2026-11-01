"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { ProjectItemsList } from "./ProjectItemsList";
import { ProjectItemsViewer } from "./ProjectItemsViewer";
import { ProjectItemsEditor } from "./ProjectItemsEditor";

export function ProjectItemsClient() {
  return (
    <AcademyDataPage
      title="Roadmap Projects"
      description="Manage community-submitted and official developer projects, challenges, reviews, and roadmaps curation."
      itemNamePlural="Projects"
      renderTable={(props) => <ProjectItemsList {...props} />}
      renderViewer={(props) => <ProjectItemsViewer {...props} />}
      renderEditor={(props) => <ProjectItemsEditor {...props} />}
    />
  );
}

