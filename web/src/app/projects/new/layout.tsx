export { createProjectMeta as metadata } from "@/meta/projects/static";

export default function CreateProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
