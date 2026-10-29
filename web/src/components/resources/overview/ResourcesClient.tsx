"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { SearchX, Search, X, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyDisplay } from "@/components/shared/StatusState";
import type { RoadmapSummary, RoadmapCategory } from "@/types/resource";
import {
  ResourcesDesktopSidebar,
  ResourcesMobileHeader,
} from "./resources-sidebar";


interface ResourcesClientProps {
  roadmaps: RoadmapSummary[];
  categories: RoadmapCategory[];
}

export function ResourcesClient({
  roadmaps,
  categories,
}: ResourcesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fallback category if none selected
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategory) || categories[0];
  }, [categories, selectedCategory]);

  const activeCategoryTitle = activeCategory?.title || "All Roadmaps";

  // Filter roadmaps when user types in search bar
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return roadmaps.filter((r) => {
      const cardTitle = r.title?.card?.toLowerCase() || "";
      const pageTitle = r.title?.page?.toLowerCase() || "";
      const slug = r.slug.toLowerCase();
      const desc = r.description?.toLowerCase() || "";
      return (
        cardTitle.includes(q) ||
        pageTitle.includes(q) ||
        slug.includes(q) ||
        desc.includes(q)
      );
    });
  }, [roadmaps, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex-1 flex w-full">
      <div className="flex w-full flex-col lg:flex-row">
        {/* Mobile Slide-out Header */}
        <ResourcesMobileHeader
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            setSearchQuery("");
          }}
        />

        {/* Desktop Sticky Sidebar */}
        <ResourcesDesktopSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            setSearchQuery("");
          }}
        />

        {/* Content Area with Independent Scroll */}
        <main className="flex-1 min-w-0">
          <div className="px-4 sm:px-8 lg:px-12 pt-40 lg:pt-20 pb-16 max-h-screen overflow-y-auto mx-auto relative space-y-8">
            {/* Top Row: Category Title on Left, Search Bar on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {isSearching ? `Search Results` : activeCategoryTitle}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isSearching
                  && `Found ${searchResults.length} ${
                        searchResults.length === 1 ? "roadmap" : "roadmaps"
                      } matching "${searchQuery.trim()}"`
                  }
                </p>
              </div>

              {/* Search Bar on Right Side */}
              <div className="relative w-full sm:w-72 md:w-80 shrink-0">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="resources-search-input"
                  type="text"
                  className="pl-9 pr-9 bg-card/50 border-border h-10 text-xs sm:text-sm"
                  placeholder={`Search roadmaps...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* If user is actively searching */}
            {isSearching ? (
              searchResults.length > 0 ? (
                <div className="space-y-4 pb-16">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/resources/${r.slug}`}
                        prefetch={true}
                        id={`roadmap-item-${r.slug}`}
                        className="group relative flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3.5 py-2.5 text-left text-sm font-medium shadow-xs transition-all hover:border-primary/50 hover:bg-muted/70 hover:shadow-sm"
                      >
                        <span className="truncate text-foreground group-hover:text-primary transition-colors">
                          {r.title?.card || r.title?.page || r.slug}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyDisplay
                  icon={SearchX}
                  title="No matches found"
                  message={`No roadmaps matched your query "${searchQuery.trim()}".`}
                  action={
                    <Button
                      id="clear-resources-filters-btn"
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  }
                  className="mt-6 py-12"
                />
              )

            ) : activeCategory?.sections && activeCategory.sections.length > 0 ? (
              /* Normal Category View: Render Sections */
              <div className="space-y-10 pb-16">
                {activeCategory.sections.map((section) => (
                  <section
                    key={section.heading}
                    id={`section-${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="space-y-3"
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between pb-1">
                      <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                        {section.heading}
                      </h2>
                    </div>

                    {/* Section Pills Grid (2 columns on sm+, 1 column on mobile) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {section.roadmaps.map((r) => (
                        <Link
                          key={r.slug}
                          href={`/resources/${r.slug}`}
                          prefetch={true}
                          id={`roadmap-item-${r.slug}`}
                          className="group relative flex items-center justify-between rounded-lg border border-border/50 bg-card/80 px-3.5 py-3 text-left text-sm font-medium shadow-xs transition-all hover:border-primary/50 hover:bg-muted/70 hover:shadow-sm"
                        >
                          <span className="truncate text-foreground group-hover:text-primary transition-colors">
                            {r.title}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyDisplay
                icon={SearchX}
                title="No roadmaps in this category"
                message={`There are currently no roadmaps listed under ${activeCategoryTitle}.`}
                action={
                  <Button
                    id="reset-resources-category-btn"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    View All Roadmaps
                  </Button>
                }
                className="mt-6 py-12"
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
