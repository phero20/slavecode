import type { Metadata } from "next";

export const resourcesHubMeta: Metadata = {
  title: "Developer Roadmaps",
  description:
    "Explore interactive community-driven developer roadmaps, career paths, and skill trees across Web Development, AI/ML, DevOps, and System Design.",
  keywords: [
    "developer roadmaps",
    "career paths",
    "learn to code",
    "frontend roadmap",
    "backend roadmap",
    "devops roadmap",
    "system design",
    "coding resources",
  ],
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Developer Roadmaps | SlaveCode",
    description:
      "Explore interactive community-driven developer roadmaps, career paths, and skill trees across Web Development, AI/ML, DevOps, and System Design.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Roadmaps | SlaveCode",
    description:
      "Explore interactive community-driven developer roadmaps, career paths, and skill trees across Web Development, AI/ML, DevOps, and System Design.",
  },
};

export const createResourceMeta: Metadata = {
  title: "Submit a Resource",
  description: "Share a learning resource with the SlaveCode community.",
  robots: { index: false, follow: false },
};

export const editResourceMeta: Metadata = {
  title: "Edit Resource",
  description: "Update your submitted learning resource on SlaveCode.",
  robots: { index: false, follow: false },
};
