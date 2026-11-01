"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeveloperRoadmaps,
  useRoadmapCategories,
  useRoadmapDetail,
} from "@/hooks/useResource";
import {
  Loader2,
  ChevronLeft,
  Save,
  GitBranch,
  Layers,
  Globe,
  Settings,
  Sparkles,
  AlertCircle,
  FileCode,
} from "lucide-react";
import type {
  CreateRoadmapPayload,
  UpdateRoadmapPayload,
  Roadmap,
} from "@/types/resource";

interface RoadmapEditorProps {
  slug?: string;
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RoadmapEditor({
  slug,
  id,
  onSuccess,
  onCancel,
}: RoadmapEditorProps) {
  const targetSlug = slug || id;
  const isEditMode = Boolean(targetSlug);

  const { createRoadmap, updateRoadmap, isCreating, isUpdating } =
    useDeveloperRoadmaps();
  const { categories } = useRoadmapCategories();
  const { roadmap: existingRoadmap, isLoading: isDetailLoading } =
    useRoadmapDetail(targetSlug);

  const isSubmitting = isCreating || isUpdating;

  // Form States
  const [formSlug, setFormSlug] = useState("");
  const [titleCard, setTitleCard] = useState("");
  const [titlePage, setTitlePage] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"role" | "skill">("role");
  const [status, setStatus] = useState<"published" | "draft" | "archived">("draft");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [relatedRoadmapsInput, setRelatedRoadmapsInput] = useState("");

  // Canvas / Dimensions
  const [dimWidth, setDimWidth] = useState<number>(1200);
  const [dimHeight, setDimHeight] = useState<number>(2000);

  // Graph JSON
  const [nodesJson, setNodesJson] = useState("[]");
  const [edgesJson, setEdgesJson] = useState("[]");

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [activeTab, setActiveTab] = useState("basic");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Populate form on edit
  useEffect(() => {
    if (existingRoadmap) {
      setFormSlug(existingRoadmap.slug || "");
      setTitleCard(existingRoadmap.title?.card || "");
      setTitlePage(existingRoadmap.title?.page || "");
      setDescription(existingRoadmap.description || "");
      setType(existingRoadmap.type || "role");
      setStatus(existingRoadmap.status || "draft");

      // Auto-derive categories from category sections if empty
      let initialCats = existingRoadmap.categories || [];
      if (initialCats.length === 0 && categories) {
        initialCats = categories
          .filter((cat) =>
            cat.sections?.some((s) =>
              s.roadmaps?.some((r) => r.slug === existingRoadmap.slug)
            )
          )
          .map((cat) => cat.categoryId);
      }
      setSelectedCategories(initialCats);
      setRelatedRoadmapsInput((existingRoadmap.relatedRoadmaps || []).join(", "));

      setDimWidth(existingRoadmap.dimensions?.width || 1200);
      setDimHeight(existingRoadmap.dimensions?.height || 2000);

      setNodesJson(
        existingRoadmap.nodes
          ? JSON.stringify(existingRoadmap.nodes, null, 2)
          : "[]"
      );
      setEdgesJson(
        existingRoadmap.edges
          ? JSON.stringify(existingRoadmap.edges, null, 2)
          : "[]"
      );

      const seo = existingRoadmap.seo || {};
      setSeoTitle(seo.title || "");
      setSeoDescription(seo.description || "");
      setSeoKeywords(
        Array.isArray(seo.keywords)
          ? seo.keywords.join(", ")
          : seo.keywords || ""
      );
    } else if (!isEditMode) {
      setFormSlug("");
      setTitleCard("");
      setTitlePage("");
      setDescription("");
      setType("role");
      setStatus("draft");
      setSelectedCategories([]);
      setRelatedRoadmapsInput("");
      setDimWidth(1200);
      setDimHeight(2000);
      setNodesJson("[]");
      setEdgesJson("[]");
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords("");
    }
  }, [existingRoadmap, isEditMode]);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleFormatJson = (field: "nodes" | "edges") => {
    try {
      if (field === "nodes") {
        const parsed = JSON.parse(nodesJson);
        setNodesJson(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(edgesJson);
        setEdgesJson(JSON.stringify(parsed, null, 2));
      }
      setValidationError(null);
    } catch (e: any) {
      setValidationError(`Invalid JSON in ${field}: ${e.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanSlug = formSlug.trim().toLowerCase();
    const cleanTitleCard = titleCard.trim();
    const cleanTitlePage = titlePage.trim();

    if (!cleanSlug) {
      setValidationError("Roadmap slug is required.");
      setActiveTab("basic");
      return;
    }

    if (!cleanTitleCard || !cleanTitlePage) {
      setValidationError("Both Title Card and Title Page are required.");
      setActiveTab("basic");
      return;
    }

    // Parse Nodes & Edges
    let parsedNodes: any[] = [];
    let parsedEdges: any[] = [];

    try {
      parsedNodes = JSON.parse(nodesJson);
      if (!Array.isArray(parsedNodes)) {
        throw new Error("Nodes must be a JSON array.");
      }
    } catch (err: any) {
      setValidationError(`Invalid Nodes JSON: ${err.message}`);
      setActiveTab("graph");
      return;
    }

    try {
      parsedEdges = JSON.parse(edgesJson);
      if (!Array.isArray(parsedEdges)) {
        throw new Error("Edges must be a JSON array.");
      }
    } catch (err: any) {
      setValidationError(`Invalid Edges JSON: ${err.message}`);
      setActiveTab("graph");
      return;
    }

    // Related roadmaps
    const parsedRelated = relatedRoadmapsInput
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    // SEO
    const seoObject: Record<string, any> = {};
    if (seoTitle.trim()) seoObject.title = seoTitle.trim();
    if (seoDescription.trim()) seoObject.description = seoDescription.trim();
    if (seoKeywords.trim()) {
      seoObject.keywords = seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }

    const payloadData: any = {
      title: {
        card: cleanTitleCard,
        page: cleanTitlePage,
      },
      description: description.trim(),
      type,
      status,
      categories: selectedCategories,
      nodes: parsedNodes,
      edges: parsedEdges,
      dimensions: {
        width: Number(dimWidth) || 1200,
        height: Number(dimHeight) || 2000,
      },
      relatedRoadmaps: parsedRelated,
      seo: seoObject,
    };

    try {
      if (isEditMode) {
        await updateRoadmap({
          slug: cleanSlug,
          payload: payloadData as UpdateRoadmapPayload,
        });
      } else {
        await createRoadmap({
          slug: cleanSlug,
          ...payloadData,
        } as CreateRoadmapPayload);
      }
      onSuccess();
    } catch (err) {
      // Toast handles error notifications
    }
  };

  if (isEditMode && isDetailLoading && !existingRoadmap) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isEditMode && !existingRoadmap && !isDetailLoading) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-destructive font-medium">Roadmap not found.</p>
        <Button id="roadmap-editor-notfound-back-btn" onClick={onCancel}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full min-h-0 space-y-6 p-1"
    >
      {/* Top Sticky Header */}
      <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            id="roadmap-editor-cancel-btn"
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={onCancel}
            title="Go Back"
            className="gap-1 rounded-full shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {isEditMode
                ? `Edit Roadmap: ${existingRoadmap?.title?.card || formSlug}`
                : "Create Developer Roadmap"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? "Update titles, categories, flow graph nodes, and publishing status."
                : "Configure a new role or skill developer roadmap."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            id="roadmap-editor-save-btn"
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="px-6 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? "Save Changes" : "Create Roadmap"}
              </>
            )}
          </Button>
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md flex items-center gap-2 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Editor Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="border-b shrink-0">
          <TabsList className="bg-transparent h-9 p-0 space-x-4">
            <TabsTrigger
              value="basic"
              className="gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-1.5 text-xs font-semibold"
            >
              <Settings className="h-3.5 w-3.5" />
              General Details
            </TabsTrigger>
            <TabsTrigger
              value="graph"
              className="gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-1.5 text-xs font-semibold"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Flow Graph Data
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-1.5 text-xs font-semibold"
            >
              <Globe className="h-3.5 w-3.5" />
              SEO & Metadata
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Basic Information */}
        <TabsContent
          value="basic"
          className="flex-1 overflow-auto min-h-0 space-y-6 pt-4 pr-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slug */}
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="roadmap-slug-input" className="text-xs font-semibold">
                Roadmap Slug *
              </Label>
              <Input
                id="roadmap-slug-input"
                placeholder="e.g. frontend, react, backend, devops"
                value={formSlug}
                onChange={(e) =>
                  setFormSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "")
                  )
                }
                disabled={isEditMode}
                required
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                {isEditMode
                  ? "Unique identifier slug is locked on edit."
                  : "Unique URL slug (e.g. 'full-stack', 'python')."}
              </p>
            </div>

            {/* Type */}
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="roadmap-type-select" className="text-xs font-semibold">
                Roadmap Type
              </Label>
              <Select
                value={type}
                onValueChange={(val: "role" | "skill") => setType(val)}
              >
                <SelectTrigger id="roadmap-type-select" className="text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">Role (e.g. Frontend, Backend, DevOps)</SelectItem>
                  <SelectItem value="skill">Skill (e.g. React, Git, Docker, Python)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Specifies whether this is a career role or a specific skill track.
              </p>
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="roadmap-title-card-input" className="text-xs font-semibold">
                Card Title *
              </Label>
              <Input
                id="roadmap-title-card-input"
                placeholder="e.g. Frontend, Backend"
                value={titleCard}
                onChange={(e) => setTitleCard(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Short title shown on navigation cards and grid badges.
              </p>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label htmlFor="roadmap-title-page-input" className="text-xs font-semibold">
                Page Title *
              </Label>
              <Input
                id="roadmap-title-page-input"
                placeholder="e.g. Frontend Developer Roadmap"
                value={titlePage}
                onChange={(e) => setTitlePage(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Full hero title displayed on the roadmap page.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="roadmap-description-input" className="text-xs font-semibold">
              Description
            </Label>
            <Textarea
              id="roadmap-description-input"
              placeholder="Step by step guide to becoming a modern frontend developer in 2026..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[90px] text-xs leading-relaxed"
            />
          </div>

          {/* Status & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="roadmap-status-select" className="text-xs font-semibold">
                Publishing Status
              </Label>
              <Select
                value={status}
                onValueChange={(val: "published" | "draft" | "archived") =>
                  setStatus(val)
                }
              >
                <SelectTrigger id="roadmap-status-select" className="text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published (Visible publicly)</SelectItem>
                  <SelectItem value="draft">Draft (Hidden from users)</SelectItem>
                  <SelectItem value="archived">Archived (Deprecated)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Related Roadmaps */}
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="roadmap-related-input" className="text-xs font-semibold">
                Related Roadmaps (Comma separated slugs)
              </Label>
              <Input
                id="roadmap-related-input"
                placeholder="e.g. backend, full-stack, react"
                value={relatedRoadmapsInput}
                onChange={(e) => setRelatedRoadmapsInput(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Slugs of other roadmaps to cross-link on the roadmap page.
              </p>
            </div>
          </div>

          {/* Categories Selector */}
          <div className="space-y-3 p-4 rounded-lg border bg-card/40">
            <Label className="text-xs font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Assigned Categories ({selectedCategories.length} selected)
            </Label>
            <p className="text-xs text-muted-foreground">
              Select all categories where this roadmap should be listed.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories?.map((cat) => {
                const isSelected = selectedCategories.includes(cat.categoryId);
                return (
                  <button
                    key={cat.categoryId}
                    id={`toggle-category-${cat.categoryId}`}
                    type="button"
                    onClick={() => toggleCategory(cat.categoryId)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {cat.title} ({cat.categoryId})
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Graph Flow Data (Nodes & Edges) */}
        <TabsContent
          value="graph"
          className="flex-1 overflow-auto min-h-0 space-y-6 pt-4 pr-1"
        >
          {/* Canvas Dimensions */}
          <Card className="bg-card/40 border-border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                Canvas Coordinate Dimensions
              </CardTitle>
              <CardDescription className="text-xs">
                Bounding dimensions for the interactive React Flow roadmap viewer canvas.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="roadmap-dim-width" className="text-xs font-semibold">
                  Canvas Width (px)
                </Label>
                <Input
                  id="roadmap-dim-width"
                  type="number"
                  min="400"
                  value={dimWidth}
                  onChange={(e) => setDimWidth(parseInt(e.target.value, 10) || 1200)}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="roadmap-dim-height" className="text-xs font-semibold">
                  Canvas Height (px)
                </Label>
                <Input
                  id="roadmap-dim-height"
                  type="number"
                  min="400"
                  value={dimHeight}
                  onChange={(e) => setDimHeight(parseInt(e.target.value, 10) || 2000)}
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Nodes JSON Editor */}
          <Card className="bg-card/40 border-border">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  Nodes JSON Array
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Flow graph node definitions including id, position (x, y), label, and sub-items.
                </CardDescription>
              </div>
              <Button
                id="format-nodes-json-btn"
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFormatJson("nodes")}
                className="gap-1 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Format JSON
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                id="roadmap-nodes-json"
                value={nodesJson}
                onChange={(e) => setNodesJson(e.target.value)}
                className="font-mono text-xs min-h-[220px] resize-y"
                placeholder='[\n  {\n    "id": "1",\n    "type": "custom",\n    "position": { "x": 100, "y": 100 },\n    "data": { "label": "Basics" }\n  }\n]'
              />
            </CardContent>
          </Card>

          {/* Edges JSON Editor */}
          <Card className="bg-card/40 border-border">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Edges JSON Array
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Connections between nodes including id, source, and target.
                </CardDescription>
              </div>
              <Button
                id="format-edges-json-btn"
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFormatJson("edges")}
                className="gap-1 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Format JSON
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                id="roadmap-edges-json"
                value={edgesJson}
                onChange={(e) => setEdgesJson(e.target.value)}
                className="font-mono text-xs min-h-[160px] resize-y"
                placeholder='[\n  {\n    "id": "e1-2",\n    "source": "1",\n    "target": "2"\n  }\n]'
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: SEO & Meta */}
        <TabsContent
          value="seo"
          className="flex-1 overflow-auto min-h-0 space-y-6 pt-4 pr-1"
        >
          <Card className="bg-card/40 border-border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Search Engine Optimization (SEO)
              </CardTitle>
              <CardDescription className="text-xs">
                Custom meta tags for social previews and search engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="roadmap-seo-title" className="text-xs font-semibold">
                  Meta Title
                </Label>
                <Input
                  id="roadmap-seo-title"
                  placeholder="e.g. Frontend Developer Roadmap 2026 | Coding Arena"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="roadmap-seo-desc" className="text-xs font-semibold">
                  Meta Description
                </Label>
                <Textarea
                  id="roadmap-seo-desc"
                  placeholder="Comprehensive step by step guide to become a modern developer..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="min-h-[80px] text-xs"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="roadmap-seo-keywords" className="text-xs font-semibold">
                  Meta Keywords (Comma separated)
                </Label>
                <Input
                  id="roadmap-seo-keywords"
                  placeholder="frontend, react, web development, javascript roadmap"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}

