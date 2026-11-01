"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { ResourceItemsList } from "./ResourceItemsList";
import { ResourceItemsViewer } from "./ResourceItemsViewer";
import { ResourceItemsEditor } from "./ResourceItemsEditor";

export function ResourceItemsClient() {
  return (
    <AcademyDataPage
      title="Learning Resources"
      description="Manage community-uploaded and official learning resources, review approvals and rejections, and curate roadmaps."
      itemNamePlural="Resources"
      renderTable={(props) => <ResourceItemsList {...props} />}
      renderViewer={(props) => <ResourceItemsViewer {...props} />}
      renderEditor={(props) => <ResourceItemsEditor {...props} />}
    />
  );
}

