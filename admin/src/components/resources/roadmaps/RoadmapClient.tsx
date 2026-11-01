"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { RoadmapList } from "./RoadmapList";
import { RoadmapViewer } from "./RoadmapViewer";
import { RoadmapEditor } from "./RoadmapEditor";

export function RoadmapClient() {
  return (
    <AcademyDataPage
      title="Developer Roadmaps"
      description="Manage developer role and skill roadmaps, flow graphs, nodes, and publishing status."
      itemNamePlural="Roadmaps"
      renderTable={(props) => <RoadmapList {...props} />}
      renderViewer={(props) => <RoadmapViewer {...props} />}
      renderEditor={(props) => <RoadmapEditor {...props} />}
    />
  );
}

