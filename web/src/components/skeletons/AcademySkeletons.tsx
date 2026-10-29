import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

export function AcademyTracksSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div 
            key={i} 
            className="flex flex-row items-center gap-6 overflow-hidden p-6 border border-border/40 bg-card/20 rounded-xl h-full min-h-35"
          >
            {/* Icon Side Ghost */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center">
              <Skeleton width={80} height={80} className="opacity-20 rounded-md" />
            </div>

            {/* Content Side Ghost */}
            <div className="flex flex-1 flex-col gap-2 min-w-0">
              <Skeleton width="50%" height={24} className="rounded-sm" />

              <div className="flex items-center gap-1.5 mt-0.5">
                <Skeleton circle width={16} height={16} className="opacity-40" />
                <Skeleton width={90} height={14} className="rounded-sm opacity-60" />
              </div>

              {/* Tags Ghost */}
              <div className="mt-1 flex flex-wrap gap-2">
                <Skeleton width={60} height={22} className="rounded-md opacity-40" />
                <Skeleton width={80} height={22} className="rounded-md opacity-40" />
                <Skeleton width={50} height={22} className="rounded-md opacity-40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonProvider>
  );
}

export function TrackDetailsSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="flex flex-col min-h-screen bg-background py-24">
        {/* Top Header & Tabs Row */}
        <div className="w-full bg-background relative z-10 border-b">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {/* SlugHeader Ghost */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10 py-6">
              {/* Left side: Icon & Title */}
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton width={64} height={64} className="rounded-xl opacity-20" />
                <Skeleton width={180} height={42} className="rounded-md opacity-40" />
              </div>
              {/* Right side: Blurb border-l */}
              <div className="flex-1 max-w-3xl border-l-[3px] border-border/70 pl-5 py-0.5">
                <Skeleton width="90%" height={16} className="rounded-sm opacity-30" />
                <Skeleton width="60%" height={16} className="rounded-sm opacity-20 mt-1.5" />
              </div>
            </div>

            {/* TabsList Ghost */}
            <div className="flex items-center gap-8 py-4">
              <Skeleton width={60} height={20} className="rounded-sm opacity-30" />
              <Skeleton width={120} height={20} className="rounded-sm opacity-30" />
              <Skeleton width={70} height={20} className="rounded-sm opacity-30" />
              <Skeleton width={80} height={20} className="rounded-sm opacity-30" />
            </div>
          </div>
        </div>

        {/* Content Ghost: About Page Hero Layout */}
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content Ghost */}
            <div className="space-y-6">
              <Skeleton width="85%" height={48} className="rounded-md opacity-40" />
              <Skeleton width="65%" height={48} className="rounded-md opacity-30 -mt-2" />
              <div className="space-y-2 pt-2">
                <Skeleton count={3} height={16} className="rounded-sm opacity-30" />
                <Skeleton width="75%" height={16} className="rounded-sm opacity-20" />
              </div>
              <div className="flex gap-4 pt-4">
                <Skeleton width={200} height={52} className="rounded-lg opacity-40" />
                <Skeleton width={160} height={52} className="rounded-lg opacity-25" />
              </div>
            </div>

            {/* Right Visual Ghost */}
            <div className="hidden lg:flex items-center justify-center min-h-[300px]">
              <Skeleton circle width={220} height={220} className="opacity-15" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonProvider>
  );
}

export function ConceptViewSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {/* Header Title Skeleton */}
        <div className="mb-10 flex flex-col items-center">
          <Skeleton width={200} height={40} className="mb-3 rounded-md" />
          <Skeleton width={150} height={20} className="rounded-md opacity-60" />
        </div>

        {/* Content Paragraphs & Blocks */}
        <div className="space-y-8">
          <div>
            <Skeleton width={180} height={28} className="mb-4 rounded-sm" />
            <Skeleton count={4} className="mb-3 rounded-sm opacity-40" />
            <Skeleton width="85%" className="rounded-sm opacity-40" />
          </div>

          {/* Fake Code Block */}
          <div className="border border-border/40 bg-card/10 rounded-lg p-5 space-y-2.5">
            <Skeleton width="40%" height={16} className="rounded-sm opacity-30" />
            <Skeleton width="70%" height={16} className="rounded-sm opacity-30" />
            <Skeleton width="55%" height={16} className="rounded-sm opacity-30" />
            <Skeleton width="80%" height={16} className="rounded-sm opacity-30" />
          </div>

          <div>
            <Skeleton width={120} height={28} className="mb-4 rounded-sm" />
            <Skeleton count={3} className="mb-3 rounded-sm opacity-40" />
            <Skeleton width="60%" className="rounded-sm opacity-40" />
          </div>
        </div>
      </div>
    </SkeletonProvider>
  );
}

export function AcademyResultSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="flex flex-col space-y-4 pb-10 w-full animate-pulse mt-2">
        {/* Header Summary Skeleton */}
        <div className="border shadow-sm bg-card/10 border-border/40 rounded-xl">
           <div className="p-4 flex flex-row items-center gap-3">
             <Skeleton circle width={24} height={24} className="opacity-20" />
             <div className="flex flex-col w-full max-w-[250px]">
               <Skeleton width={150} height={16} className="rounded-sm opacity-40 mb-1" />
               <Skeleton width={100} height={14} className="rounded-sm opacity-30" />
             </div>
           </div>
        </div>

        {/* List of failed tests skeleton */}
        <div className="flex flex-col space-y-6 mt-2">
           {Array.from({ length: 2 }).map((_, i) => (
             <div key={i} className="flex flex-col space-y-4 border-b border-border/20 pb-6 last:border-0">
               <div className="flex items-center gap-2 mb-1">
                 <Skeleton circle width={14} height={14} className="opacity-20" />
                 <Skeleton width={120} height={14} className="rounded-sm opacity-30" />
               </div>
               
               <div className="space-y-4">
                 <div className="space-y-2 p-4 border border-border/40 rounded-xl bg-card/10">
                   <Skeleton width={100} height={12} />
                   <Skeleton height={40} className="mt-2" />
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </SkeletonProvider>
  );
}
