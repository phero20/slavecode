export { createResourceMeta as metadata } from "@/meta/resources/static";

export default function CreateResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
