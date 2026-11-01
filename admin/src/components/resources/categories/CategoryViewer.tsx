"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Layers, MapPin, Hash, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { QueryState } from "@/components/ui/query-state";
import { useRoadmapCategories } from "@/hooks/useResource";

interface CategoryViewerProps {
  id: string;
  slug: string;
  onBack: () => void;
}

export function CategoryViewer({ id, slug, onBack }: CategoryViewerProps) {
  const { categories, isLoading, isError, error } = useRoadmapCategories();

  const category = categories?.find(
    (c) => c.id === id || c.categoryId === id || c.categoryId === slug
  );

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading category details..."
      isError={isError}
      error={error}
      errorTitle="Failed to load category"
    >
      {!category ? (
        <div className="space-y-4 p-4">
          <p className="text-destructive font-medium">Category not found.</p>
          <Button id="category-viewer-notfound-back-btn" onClick={onBack}>
            Go Back
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
          {/* Top Sticky Header */}
          <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
            <div className="flex items-center gap-4">
              <Button
                id="category-viewer-back-btn"
                variant="secondary"
                size="icon-lg"
                onClick={onBack}
                title="Go Back"
                className="gap-1 rounded-full shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {category.title}
                  </h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {category.categoryId}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Order #{category.order ?? 0}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Category details and grouped roadmap sections.
                </p>
              </div>
            </div>
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-auto min-h-0 space-y-6 pr-1">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-muted/20 border-border">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Category Slug</CardDescription>
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    {category.categoryId}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-muted/20 border-border">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Display Order</CardDescription>
                  <CardTitle className="text-xl font-bold">
                    #{category.order ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-muted/20 border-border">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Active Roadmaps</CardDescription>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                    <MapPin className="h-5 w-5" />
                    {category.count || 0}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-muted/20 border-border">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Sections</CardDescription>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                    {category.sections?.length || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Sections Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Category Sections ({category.sections?.length || 0})
                </h4>
              </div>

              {!category.sections || category.sections.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No sections defined for this category. Sections help group related roadmaps under headings.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.sections.map((section, sIdx) => (
                    <Card key={sIdx} className="bg-card/40 border-border">
                      <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {sIdx + 1}
                            </span>
                            {section.heading}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {section.roadmaps?.length || 0}{" "}
                            {section.roadmaps?.length === 1 ? "roadmap" : "roadmaps"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {!section.roadmaps || section.roadmaps.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">
                            No roadmaps listed under this heading.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {section.roadmaps.map((rm, rIdx) => (
                              <div
                                key={rIdx}
                                className="flex items-center justify-between p-2 rounded-md bg-muted/30 border text-xs"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                                  <span className="font-medium text-foreground truncate">
                                    {rm.title}
                                  </span>
                                </div>
                                <span className="font-mono text-[11px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border shrink-0">
                                  {rm.slug}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </QueryState>
  );
}

