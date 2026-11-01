"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChevronLeft,
  GitBranch,
  Layers,
  Hash,
  CheckCircle2,
  Clock,
  Archive,
  Code,
  Layout,
  Copy,
  Check,
  Maximize2,
  Share2,
  Globe,
} from "lucide-react";
import { QueryState } from "@/components/ui/query-state";
import { useRoadmapDetail, useRoadmapCategories } from "@/hooks/useResource";
import type { Roadmap } from "@/types/resource";

interface RoadmapViewerProps {
  slug: string;
  id: string;
  onBack: () => void;
}

export function RoadmapViewer({ slug, id, onBack }: RoadmapViewerProps) {
  const targetSlug = slug || id;
  const { roadmap, isLoading, isError, error } = useRoadmapDetail(targetSlug);
  const { categories } = useRoadmapCategories();
  const [viewMode, setViewMode] = useState<"ui" | "json">("ui");
  const [copied, setCopied] = useState(false);

  // Derive categories from categories sections if roadmap.categories is empty
  const assignedCategories = useMemo(() => {
    if (!roadmap) return [];
    if (roadmap.categories && roadmap.categories.length > 0) {
      return roadmap.categories;
    }
    const list: string[] = [];
    categories?.forEach((cat) => {
      const inCat = cat.sections?.some((s) =>
        s.roadmaps?.some((r) => r.slug === roadmap.slug)
      );
      if (inCat && !list.includes(cat.categoryId)) {
        list.push(cat.categoryId);
      }
    });
    return list;
  }, [roadmap, categories]);

  const handleCopy = () => {
    if (!roadmap) return;
    navigator.clipboard.writeText(JSON.stringify(roadmap, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "published":
        return (
          <Badge
            variant="default"
            className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1 font-normal text-xs"
          >
            <CheckCircle2 className="h-3 w-3" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/15 text-amber-400 border border-amber-500/30 gap-1 font-normal text-xs"
          >
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground border-border gap-1 font-normal text-xs"
          >
            <Archive className="h-3 w-3" />
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading roadmap details..."
      isError={isError}
      error={error}
      errorTitle="Failed to load roadmap"
    >
      {!roadmap ? (
        <div className="space-y-4 p-4">
          <p className="text-destructive font-medium">Roadmap not found.</p>
          <Button id="roadmap-viewer-notfound-back-btn" onClick={onBack}>
            Go Back
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
          {/* Top Sticky Header */}
          <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
            <div className="flex items-center gap-4">
              <Button
                id="roadmap-viewer-back-btn"
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
                    {roadmap.title?.card || roadmap.slug}
                  </h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {roadmap.slug}
                  </Badge>
                  <Badge variant="secondary" className="text-xs uppercase font-mono">
                    {roadmap.type || "role"}
                  </Badge>
                  {getStatusBadge(roadmap.status)}
                </div>
                {roadmap.title?.page && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {roadmap.title.page}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                id="roadmap-viewer-toggle-mode-btn"
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "ui" ? "json" : "ui")}
                className="gap-1.5"
              >
                {viewMode === "ui" ? (
                  <>
                    <Code className="w-4 h-4" />
                    JSON View
                  </>
                ) : (
                  <>
                    <Layout className="w-4 h-4" />
                    UI View
                  </>
                )}
              </Button>
              <Button
                id="roadmap-viewer-copy-btn"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy JSON
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Scrollable Area */}
          <div className="flex-1 overflow-auto min-h-0 space-y-6 pr-1">
            {viewMode === "json" ? (
              <div className="rounded-lg border bg-muted/20 p-4 font-mono text-xs overflow-auto">
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(roadmap, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Metric Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-muted/20 border-border">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs">Roadmap Slug</CardDescription>
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        {roadmap.slug}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-muted/20 border-border">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs">Total Graph Nodes</CardDescription>
                      <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                        <GitBranch className="h-5 w-5" />
                        {roadmap.nodesCount ?? roadmap.nodes?.length ?? 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-muted/20 border-border">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs">Canvas Dimensions</CardDescription>
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <Maximize2 className="h-4 w-4 text-muted-foreground" />
                        {roadmap.dimensions?.width || 0} × {roadmap.dimensions?.height || 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-muted/20 border-border">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs">Categories Linked</CardDescription>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Layers className="h-5 w-5 text-muted-foreground" />
                        {assignedCategories.length}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Description */}
                {roadmap.description && (
                  <Card className="bg-card/40 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {roadmap.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Categories & Related Roadmaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assigned Categories */}
                  <Card className="bg-card/40 border-border">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        Assigned Categories ({assignedCategories.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {assignedCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {assignedCategories.map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="font-mono text-xs px-2.5 py-1"
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No categories assigned.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Related Roadmaps */}
                  <Card className="bg-card/40 border-border">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-primary" />
                        Related Roadmaps ({roadmap.relatedRoadmaps?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {roadmap.relatedRoadmaps &&
                      roadmap.relatedRoadmaps.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {roadmap.relatedRoadmaps.map((rel) => (
                            <Badge
                              key={rel}
                              variant="outline"
                              className="font-mono text-xs px-2.5 py-1"
                            >
                              {rel}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No related roadmaps linked.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Graph Structure Preview */}
                <Card className="bg-card/40 border-border">
                  <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        Flow Graph Structure
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {roadmap.nodes?.length || 0} Nodes · {roadmap.edges?.length || 0} Edges
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {(!roadmap.nodes || roadmap.nodes.length === 0) ? (
                      <p className="text-xs text-muted-foreground italic">
                        No nodes populated for this roadmap yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                        {roadmap.nodes.slice(0, 30).map((node: any, idx: number) => (
                          <div
                            key={node.id || idx}
                            className="p-2 rounded-md bg-muted/20 border border-border text-xs space-y-1"
                          >
                            <div className="font-medium text-foreground truncate">
                              {node.data?.label || node.label || node.id}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                              <span>ID: {node.id}</span>
                              <span className="bg-muted px-1 rounded">{node.type || "default"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {roadmap.nodes && roadmap.nodes.length > 30 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        + {roadmap.nodes.length - 30} more nodes (switch to JSON View to inspect all)
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* SEO Metadata */}
                {roadmap.seo && Object.keys(roadmap.seo).length > 0 && (
                  <Card className="bg-card/40 border-border">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        SEO & Meta Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2 text-xs">
                      {Object.entries(roadmap.seo).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-start justify-between py-1 border-b border-border/50 last:border-0"
                        >
                          <span className="font-semibold text-muted-foreground">{key}:</span>
                          <span className="text-foreground max-w-md text-right font-mono">
                            {typeof val === "object" ? JSON.stringify(val) : String(val)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </QueryState>
  );
}
