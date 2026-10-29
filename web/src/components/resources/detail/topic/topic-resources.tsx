"use client";

import React from "react";
import { Layers, Globe } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { TopicResourceItem } from "@/types/resource";
import { TopicResourceCard } from "./topic-resource-card";
import { useTopicResources, TYPE_LABELS, TYPE_ICONS } from "./hooks";

export { TYPE_LABELS, TYPE_ICONS };

interface TopicResourcesProps {
  resources: TopicResourceItem[];
}

export function TopicResources({ resources }: TopicResourcesProps) {
  const { presentTypes, grouped, hasResources, hasMultipleTypes } =
    useTopicResources(resources);

  if (!hasResources) {
    return null;
  }

  return (
    <div className="mt-8">
      {presentTypes.length > 1 ? (
        // Multiple types — show tabs
        <Tabs defaultValue="all">
          <div className="w-full border-b mb-6">
            <TabsList className="w-full justify-start border-none rounded-none h-auto p-0 bg-transparent gap-4 sm:gap-8 -mb-px overflow-x-auto scrollbar-hide">
              <TabsTrigger
                id="resource-tab-trigger-all"
                value="all"
                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 sm:py-4 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              >
                <Layers className="h-4 w-4 sm:h-5 sm:w-5" /> All
              </TabsTrigger>
              {presentTypes.map((type) => {
                const Icon = TYPE_ICONS[type] || Globe;
                return (
                  <TabsTrigger
                    key={type}
                    id={`resource-tab-trigger-${type}`}
                    value={type}
                    className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 sm:py-4 font-bold text-sm sm:text-[15px] transition-all flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
                    {TYPE_LABELS[type]}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* All tab */}
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((item, idx) => (
                <TopicResourceCard
                  key={`${item.url}-${idx}`}
                  item={item}
                  index={idx}
                />
              ))}
            </div>
          </TabsContent>

          {/* Per-type tabs */}
          {presentTypes.map((type) => (
            <TabsContent key={type} value={type} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grouped[type]?.map((item, idx) => (
                  <TopicResourceCard
                    key={`${item.url}-${idx}`}
                    item={item}
                    index={idx}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        // Only one type — no tabs needed, just a flat grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((item, idx) => (
            <TopicResourceCard
              key={`${item.url}-${idx}`}
              item={item}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TopicResources;
