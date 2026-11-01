"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { CategoryList } from "./CategoryList";
import { CategoryViewer } from "./CategoryViewer";
import { CategoryEditor } from "./CategoryEditor";

export function CategoryClient() {
  return (
    <AcademyDataPage
      title="Roadmap Categories"
      description="Manage developer roadmap categories, display ordering, and nested roadmap sections."
      itemNamePlural="Categories"
      renderTable={(props) => <CategoryList {...props} />}
      renderViewer={(props) => <CategoryViewer {...props} />}
      renderEditor={(props) => <CategoryEditor {...props} />}
    />
  );
}

