"use client";

import React from "react";
import { Info, UploadCloud, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProjectDifficulty } from "@/types/project";

interface ProjectFormBasicInfoProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  difficulty: ProjectDifficulty;
  setDifficulty: (value: ProjectDifficulty) => void;

  bannerPreview: string | null;
  isDragActive?: boolean;
  handleBannerDrag?: (e: React.DragEvent) => void;
  handleBannerDrop?: (e: React.DragEvent) => void;
  handleBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearBanner: () => void;
}

export function ProjectFormBasicInfo({
  title,
  setTitle,
  description,
  setDescription,
  difficulty,
  setDifficulty,
  bannerPreview,
  isDragActive,
  handleBannerDrag,
  handleBannerDrop,
  handleBannerChange,
  clearBanner,
}: ProjectFormBasicInfoProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Basic Information
          </h2>
          <p className="text-xs text-muted-foreground">
            Set the project title, concise pitch, and recommended difficulty.
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="project-title-input"
            className="text-xs sm:text-sm font-medium text-foreground/90"
          >
            Project Title <span className="text-destructive">*</span>
          </Label>
          <span
            className={`text-[11px] tabular-nums ${
              title.length > 120
                ? "text-destructive font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {title.length}/120
          </span>
        </div>
        <Input
          id="project-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Full-Stack E-Commerce Platform with Realtime Chat"
          maxLength={120}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="project-description-input"
            className="text-xs sm:text-sm font-medium text-foreground/90"
          >
            Short Pitch / Summary <span className="text-destructive">*</span>
          </Label>
          <span
            className={`text-[11px] tabular-nums ${
              description.length > 500
                ? "text-destructive font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {description.length}/500
          </span>
        </div>
        <Textarea
          id="project-description-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A concise 1-3 sentence summary explaining what developers will build and what makes this project challenging."
          className="min-h-[90px]"
          maxLength={500}
        />
      </div>

      {/* 2-Column: Difficulty (Left, vertical stack) & Banner (Right, small input & preview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
        {/* Difficulty Selector (Vertical stack) */}
        <div className="space-y-3">
          <Label className="text-xs sm:text-sm font-medium text-foreground/90">
            Difficulty Level <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-2.5 pt-0.5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="difficulty-beginner-checkbox"
                checked={difficulty === "beginner"}
                onCheckedChange={() => setDifficulty("beginner")}
              />
              <Label
                htmlFor="difficulty-beginner-checkbox"
                className="text-sm font-normal cursor-pointer select-none"
              >
                Beginner
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="difficulty-intermediate-checkbox"
                checked={difficulty === "intermediate"}
                onCheckedChange={() => setDifficulty("intermediate")}
              />
              <Label
                htmlFor="difficulty-intermediate-checkbox"
                className="text-sm font-normal cursor-pointer select-none"
              >
                Intermediate
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="difficulty-advanced-checkbox"
                checked={difficulty === "advanced"}
                onCheckedChange={() => setDifficulty("advanced")}
              />
              <Label
                htmlFor="difficulty-advanced-checkbox"
                className="text-sm font-normal cursor-pointer select-none"
              >
                Advanced
              </Label>
            </div>
          </div>
        </div>

        {/* Project Banner (Proper rectangle preview when selected, input/upload when empty) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={bannerPreview ? undefined : "banner-file-input"}
              className="text-xs sm:text-sm font-medium text-foreground/90"
            >
              Project Banner (Optional)
            </Label>
            {bannerPreview && (
              <span className="text-[11px] text-muted-foreground">
                Preview attached
              </span>
            )}
          </div>

          {bannerPreview ? (
            <div className="relative w-full max-w-[480px] aspect-video rounded-xl overflow-hidden border border-border bg-muted/20 shadow-sm group">
              <img
                src={bannerPreview}
                alt="Project banner preview"
                className="w-full h-full object-cover"
              />
              <Button
                id="clear-banner-btn"
                type="button"
                variant="destructive"
                size="sm"
                onClick={clearBanner}
                className="absolute top-2.5 right-2.5 h-7 px-2.5 text-xs gap-1.5 shadow-md rounded-md bg-destructive/90 hover:bg-destructive text-destructive-foreground backdrop-blur-xs transition-transform active:scale-95"
                title="Delete banner"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          ) : (
            <div
              id="banner-dropzone"
              onDragEnter={handleBannerDrag}
              onDragLeave={handleBannerDrag}
              onDragOver={handleBannerDrag}
              onDrop={handleBannerDrop}
              className={`relative flex flex-col items-center justify-center w-full max-w-[480px] aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer text-center p-4 ${
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-border/80 hover:border-primary/60 hover:bg-muted/20"
              }`}
            >
              <input
                id="banner-file-input"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="p-3 bg-muted/60 rounded-full mb-2 text-muted-foreground">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Click or drag banner image
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                16:9 rectangle &bull; PNG, JPG, WebP (up to 10MB)
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
