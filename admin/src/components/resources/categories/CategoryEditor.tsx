"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoadmapCategories } from "@/hooks/useResource";
import {
  Loader2,
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import type {
  RoadmapCategory,
  RoadmapCategorySection,
  RoadmapItemRef,
  CreateRoadmapCategoryPayload,
  UpdateRoadmapCategoryPayload,
} from "@/types/resource";

interface CategoryEditorProps {
  id?: string;
  slug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryEditor({
  id,
  slug,
  onSuccess,
  onCancel,
}: CategoryEditorProps) {
  const {
    categories,
    createCategory,
    updateCategory,
    isCreating,
    isUpdating,
    isLoading,
  } = useRoadmapCategories();

  const isEditMode = !!(id || slug);
  const existingCategory = isEditMode
    ? categories.find(
        (c) => c.id === id || c.categoryId === id || c.categoryId === slug
      )
    : null;

  const isSubmitting = isCreating || isUpdating;

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [sections, setSections] = useState<RoadmapCategorySection[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (existingCategory) {
      setCategoryId(existingCategory.categoryId || "");
      setTitle(existingCategory.title || "");
      setOrder(existingCategory.order ?? 0);
      setSections(
        existingCategory.sections && existingCategory.sections.length > 0
          ? JSON.parse(JSON.stringify(existingCategory.sections))
          : []
      );
    } else {
      setCategoryId("");
      setTitle("");
      setOrder(0);
      setSections([]);
    }
  }, [existingCategory]);

  // Section Management
  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        heading: "",
        roadmaps: [],
      },
    ]);
  };

  const handleRemoveSection = (sectionIndex: number) => {
    setSections(sections.filter((_, idx) => idx !== sectionIndex));
  };

  const handleSectionHeadingChange = (
    sectionIndex: number,
    heading: string
  ) => {
    const updated = [...sections];
    updated[sectionIndex] = { ...updated[sectionIndex], heading };
    setSections(updated);
  };

  // Roadmap Ref Management inside Section
  const handleAddRoadmapToSection = (sectionIndex: number) => {
    const updated = [...sections];
    const currentRoadmaps = updated[sectionIndex].roadmaps || [];
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      roadmaps: [...currentRoadmaps, { slug: "", title: "" }],
    };
    setSections(updated);
  };

  const handleRemoveRoadmapFromSection = (
    sectionIndex: number,
    roadmapIndex: number
  ) => {
    const updated = [...sections];
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      roadmaps: updated[sectionIndex].roadmaps.filter(
        (_, idx) => idx !== roadmapIndex
      ),
    };
    setSections(updated);
  };

  const handleRoadmapChange = (
    sectionIndex: number,
    roadmapIndex: number,
    field: "slug" | "title",
    value: string
  ) => {
    const updated = [...sections];
    const roadmaps = [...(updated[sectionIndex].roadmaps || [])];
    roadmaps[roadmapIndex] = {
      ...roadmaps[roadmapIndex],
      [field]: value,
    };
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      roadmaps,
    };
    setSections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedCategoryId = categoryId.trim().toLowerCase();
    const trimmedTitle = title.trim();

    if (!trimmedCategoryId) {
      setValidationError("Category ID is required.");
      return;
    }

    if (!trimmedTitle) {
      setValidationError("Category title is required.");
      return;
    }

    // Filter out completely empty sections or roadmaps
    const cleanedSections: RoadmapCategorySection[] = sections
      .filter((s) => s.heading.trim().length > 0)
      .map((s) => ({
        heading: s.heading.trim(),
        roadmaps: (s.roadmaps || [])
          .filter((r) => r.slug.trim().length > 0 && r.title.trim().length > 0)
          .map((r) => ({
            slug: r.slug.trim().toLowerCase(),
            title: r.title.trim(),
          })),
      }));

    try {
      if (isEditMode && existingCategory) {
        const targetId = existingCategory.id || existingCategory.categoryId;
        const payload: UpdateRoadmapCategoryPayload = {
          title: trimmedTitle,
          order: Number(order) || 0,
          sections: cleanedSections,
        };
        await updateCategory({ id: targetId, payload });
      } else {
        const payload: CreateRoadmapCategoryPayload = {
          categoryId: trimmedCategoryId,
          title: trimmedTitle,
          order: Number(order) || 0,
          sections: cleanedSections,
        };
        await createCategory(payload);
      }
      onSuccess();
    } catch (err: any) {
      // Toast handles error message
    }
  };

  if (isLoading && isEditMode && !existingCategory) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isEditMode && !existingCategory && !isLoading) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-destructive font-medium">Category not found.</p>
        <Button id="category-editor-notfound-back-btn" onClick={onCancel}>
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
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            id="category-editor-cancel-btn"
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
                ? `Edit Category: ${existingCategory?.title || categoryId}`
                : "Create New Roadmap Category"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? "Update category title, display order, and grouped roadmap sections."
                : "Define a new category to group related developer roadmaps."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            id="category-editor-save-btn"
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
                {isEditMode ? "Update Category" : "Create Category"}
              </>
            )}
          </Button>
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md shrink-0">
          {validationError}
        </div>
      )}

      {/* Main Form Fields */}
      <div className="flex-1 overflow-auto min-h-0 space-y-6 pr-1">
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold">General Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category ID */}
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="category-id-input" className="text-xs font-semibold">
                  Category ID (Slug) *
                </Label>
                <Input
                  id="category-id-input"
                  placeholder="e.g. backend, frontend, role-based"
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "")
                    )
                  }
                  disabled={isEditMode}
                  required
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  {isEditMode
                    ? "Unique identifier key is immutable."
                    : "Unique URL-friendly slug (e.g. 'backend', 'devops')."}
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="category-title-input" className="text-xs font-semibold">
                  Category Title *
                </Label>
                <Input
                  id="category-title-input"
                  placeholder="e.g. Backend Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Display title shown in tabs and navigation.
                </p>
              </div>

              {/* Order */}
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="category-order-input" className="text-xs font-semibold">
                  Display Order
                </Label>
                <Input
                  id="category-order-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Lower numbers appear first (e.g. 1, 2, 3).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections Builder Card */}
        <Card className="bg-card/40 border-border">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Category Sections & Grouped Roadmaps
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Group roadmaps under custom section headings on the roadmap index page.
              </p>
            </div>
            <Button
              id="category-add-section-btn"
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSection}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {sections.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-6 text-center">
                <Info className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">
                  No sections added yet. Click <strong>"Add Section"</strong> to create a heading
                  and group roadmap references under it.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-lg border border-border bg-muted/20 space-y-4"
                  >
                    {/* Section Header Controls */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 flex-1">
                        <Badge variant="secondary" className="font-mono text-xs shrink-0">
                          Section #{sIdx + 1}
                        </Badge>
                        <Input
                          id={`section-heading-${sIdx}`}
                          placeholder="Section Heading (e.g. Web Development, Core Skills)"
                          value={section.heading}
                          onChange={(e) =>
                            handleSectionHeadingChange(sIdx, e.target.value)
                          }
                          className="font-medium text-sm flex-1"
                        />
                      </div>
                      <Button
                        id={`remove-section-btn-${sIdx}`}
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                        onClick={() => handleRemoveSection(sIdx)}
                        title="Remove section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Roadmaps inside Section */}
                    <div className="space-y-2 pl-4 border-l-2 border-border/60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Roadmaps in this Section ({section.roadmaps?.length || 0})
                        </span>
                        <Button
                          id={`add-roadmap-btn-${sIdx}`}
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => handleAddRoadmapToSection(sIdx)}
                          className="gap-1 text-primary hover:text-primary"
                        >
                          <Plus className="h-3 w-3" />
                          Add Roadmap Ref
                        </Button>
                      </div>

                      {(!section.roadmaps || section.roadmaps.length === 0) ? (
                        <p className="text-[11px] text-muted-foreground italic py-1">
                          No roadmap references added to this section yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {section.roadmaps.map((rm, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-center gap-2 bg-background/50 p-2 rounded-md border"
                            >
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Input
                                  id={`roadmap-title-${sIdx}-${rIdx}`}
                                  placeholder="Roadmap Title (e.g. Node.js Roadmap)"
                                  value={rm.title}
                                  onChange={(e) =>
                                    handleRoadmapChange(
                                      sIdx,
                                      rIdx,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className="text-xs"
                                />
                                <Input
                                  id={`roadmap-slug-${sIdx}-${rIdx}`}
                                  placeholder="Roadmap Slug (e.g. nodejs, react)"
                                  value={rm.slug}
                                  onChange={(e) =>
                                    handleRoadmapChange(
                                      sIdx,
                                      rIdx,
                                      "slug",
                                      e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-_]/g, "")
                                    )
                                  }
                                  className="font-mono text-xs"
                                />
                              </div>
                              <Button
                                id={`remove-roadmap-btn-${sIdx}-${rIdx}`}
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                onClick={() =>
                                  handleRemoveRoadmapFromSection(sIdx, rIdx)
                                }
                                title="Remove roadmap reference"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

