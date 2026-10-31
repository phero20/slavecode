import { Suspense } from "react";
import { HomeContent } from "@/components/home/HomeContent";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}
