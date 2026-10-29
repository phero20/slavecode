"use client";

import React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlugHeader } from "@/components/academy/tracks/slug/slug-header";
import { SlugAboutTab } from "@/components/academy/tracks/slug/slug-about-tab";
import { Info, LayoutGrid, Dumbbell, ArrowLeft } from "lucide-react";
import { SlugAboutContent } from "@/components/academy/tracks/slug/slug-about-content";
import { SlugAboutFeatures } from "@/components/academy/tracks/slug/slug-about-features";
import { SlugAboutGraphPreview } from "@/components/academy/tracks/slug/slug-about-graph-preview";
import { SlugAboutPracticePreview } from "@/components/academy/tracks/slug/slug-about-practice-preview";
import { SlugLearnTab } from "@/components/academy/tracks/learn/slug-learn-tab";
import { PracticeProblemsSection } from "@/components/academy/tracks/practice/practice-problem-card";
import type { TrackConfigResponse } from "@/types/academy";
import { useTrackOverviewTabs } from "./hooks";

export interface TrackOverviewTabsProps {
  config: TrackConfigResponse;
  slug: string;
}

export const TrackOverviewTabs = ({ config, slug }: TrackOverviewTabsProps) => {
  const { activeTab, solvedExercises, handleTabChange } =
    useTrackOverviewTabs(slug);

  return (
    <div className="flex flex-col min-h-screen bg-background py-24">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Top Header & Tabs Row */}
        <div className="w-full bg-background relative z-10 border-b">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <SlugHeader config={config} />

            <TabsList className="w-full justify-start border-none rounded-none h-auto p-0 bg-transparent gap-8 mt-1">
              <Link
                href="/academy/tracks"
                prefetch={true}
                id="track-overview-back-btn"
                className="rounded-none border-b-[3px] border-transparent px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none"
              >
                <ArrowLeft className="h-5 w-5" />{" "}
                <span className="hidden md:block">Back</span>
              </Link>
              <TabsTrigger
                value="about"
                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Info className="h-5 w-5" />{" "}
                <span className="hidden md:block">About {config.language}</span>
              </TabsTrigger>
              {config.concepts && config.concepts.length > 0 && (
                <TabsTrigger
                  value="learn"
                  className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LayoutGrid className="h-5 w-5" /> Learn
                </TabsTrigger>
              )}
              <TabsTrigger
                value="practice"
                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 font-bold text-[15px] transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Dumbbell className="h-5 w-5" /> Practice
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Contents - Kept mounted in DOM for instant 0ms switching */}
        <div className="w-full">
          <TabsContent
            value="about"
            forceMount
            className="m-0 border-none p-0 focus-visible:ring-0 data-[state=inactive]:hidden"
          >
            <SlugAboutTab config={config} onTabChange={handleTabChange} />
            <SlugAboutContent
              content={config.about_content}
              language={config.language}
            />
            <SlugAboutFeatures
              features={config.key_features}
              icon={config.icon_url}
              language={config.language}
            />
            <SlugAboutGraphPreview config={config} onTabChange={handleTabChange} />
            <SlugAboutPracticePreview
              config={config}
              solvedExercises={solvedExercises}
              onTabChange={handleTabChange}
            />
          </TabsContent>

          {config.concepts && config.concepts.length > 0 && (
            <TabsContent
              value="learn"
              forceMount
              className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-7xl mt-12 mb-24 data-[state=inactive]:hidden"
            >
              <SlugLearnTab
                config={config}
                solvedExercises={solvedExercises}
              />
            </TabsContent>
          )}

          <TabsContent
            value="practice"
            forceMount
            className="m-0 border-none p-0 focus-visible:ring-0 container mx-auto px-4 md:px-6 max-w-7xl mt-12 data-[state=inactive]:hidden"
          >
            <PracticeProblemsSection
              exercises={config.exercises}
              solvedExercises={solvedExercises}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
