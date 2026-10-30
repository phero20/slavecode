import type { Metadata } from "next";

export const projectsHubMeta: Metadata = {
  title: "Developer Projects",
  description:
    "Explore curated developer projects across Frontend, Backend, DevOps, AI, Python, Node.js, and more to build your portfolio and master your craft.",
  keywords: [
    "developer projects",
    "coding projects",
    "portfolio projects",
    "frontend projects",
    "backend projects",
    "learn by building",
    "project based learning",
  ],
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Developer Projects | SlaveCode",
    description:
      "Explore curated developer projects across Frontend, Backend, DevOps, AI, Python, Node.js, and more to build your portfolio and master your craft.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Projects | SlaveCode",
    description:
      "Explore curated developer projects across Frontend, Backend, DevOps, AI, Python, Node.js, and more to build your portfolio and master your craft.",
  },
};

export const createProjectMeta: Metadata = {
  title: "Submit a Project",
  description: "Share a project idea with the SlaveCode community.",
  robots: { index: false, follow: false },
};

export const editProjectMeta: Metadata = {
  title: "Edit Project",
  description: "Update your submitted project on SlaveCode.",
  robots: { index: false, follow: false },
};
