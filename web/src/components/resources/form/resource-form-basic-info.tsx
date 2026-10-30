"use client";

import React, { useState } from "react";
import { Info, UploadCloud, Trash2, ChevronsUpDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export const RESOURCE_TYPE_OPTIONS = [
  "YouTube Playlist",
  "Video",
  "Documentation",
  "Course",
  "Article",
  "Book",
  "Podcast",
  "GitHub Repo",
] as const;

const OTHER_TYPE_VALUE = "Other";

interface ResourceFormBasicInfoProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  url: string;
  setUrl: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  author: string;
  setAuthor: (value: string) => void;

  bannerPreview: string | null;
  isDragActive?: boolean;
  handleBannerDrag?: (e: React.DragEvent) => void;
  handleBannerDrop?: (e: React.DragEvent) => void;
  handleBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearBanner: () => void;
}

export function ResourceFormBasicInfo({
  title,
  setTitle,
  description,
  setDescription,
  url,
  setUrl,
  type,
  setType,
  author,
  setAuthor,
  bannerPreview,
  isDragActive,
  handleBannerDrag,
  handleBannerDrop,
  handleBannerChange,
  clearBanner,
}: ResourceFormBasicInfoProps) {
  const [typeOpen, setTypeOpen] = useState(false);
  const isPresetType = RESOURCE_TYPE_OPTIONS.some((opt) => opt === type);
  const [isOtherType, setIsOtherType] = useState(
    () => Boolean(type) && !RESOURCE_TYPE_OPTIONS.some((opt) => opt === type)
  );
  const showOtherInput = isOtherType || (Boolean(type) && !isPresetType);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Basic Information
          </h2>
          <p className="text-xs text-muted-foreground">
            Set the title, URL, type, and an optional thumbnail for this resource.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="resource-title-input"
            className="text-xs sm:text-sm font-medium text-foreground/90"
          >
            Resource Title <span className="text-destructive">*</span>
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
          id="resource-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Full Stack Open — Complete Web Development Course"
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="resource-url-input"
            className="text-xs sm:text-sm font-medium text-foreground/90"
          >
            Resource URL <span className="text-destructive">*</span>
          </Label>
        </div>
        <Input
          id="resource-url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/playlist?list=..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="resource-description-input"
            className="text-xs sm:text-sm font-medium text-foreground/90"
          >
            Short Description (Optional)
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
          id="resource-description-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A concise summary of what this resource covers and why it is useful."
          className="min-h-[90px]"
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
        <div className="space-y-4">
          <div className="space-y-2.5">
            <Label className="text-xs sm:text-sm font-medium text-foreground/90">
              Resource Type <span className="text-destructive">*</span>
            </Label>
            <Popover open={typeOpen} onOpenChange={setTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="resource-type-trigger-btn"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={typeOpen}
                  className="w-full justify-between text-xs sm:text-sm font-normal h-10 px-3"
                >
                  <span className="truncate">
                    {showOtherInput
                      ? type
                        ? `Other · ${type}`
                        : "Other"
                      : type || "Select type..."}
                  </span>
                  <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
                sideOffset={6}
              >
                <Command>
                  <CommandInput placeholder="Search types..." />
                  <CommandList className="max-h-64">
                    <CommandEmpty>No matching type.</CommandEmpty>
                    <CommandGroup heading="Suggested Types">
                      {RESOURCE_TYPE_OPTIONS.map((opt) => {
                        const isSelected = !showOtherInput && type === opt;
                        return (
                          <CommandItem
                            key={opt}
                            id={`resource-type-opt-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                            value={opt}
                            onSelect={() => {
                              setIsOtherType(false);
                              setType(opt);
                              setTypeOpen(false);
                            }}
                            className="cursor-pointer text-sm flex items-center justify-between py-2 px-2.5"
                          >
                            <span>{opt}</span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    <CommandGroup>
                      <CommandItem
                        id="resource-type-opt-other"
                        value={OTHER_TYPE_VALUE}
                        onSelect={() => {
                          setIsOtherType(true);
                          if (isPresetType) setType("");
                          setTypeOpen(false);
                        }}
                        className="cursor-pointer text-sm flex items-center justify-between py-2 px-2.5"
                      >
                        <span>Other</span>
                        {showOtherInput && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {showOtherInput && (
              <div className="space-y-1.5 pt-1">
                <Label
                  htmlFor="resource-type-other-input"
                  className="text-xs sm:text-sm font-medium text-foreground/90"
                >
                  Custom type <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="resource-type-other-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. Newsletter, Interactive Tutorial, Cheatsheet"
                  maxLength={80}
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="resource-author-input"
              className="text-xs sm:text-sm font-medium text-foreground/90"
            >
              Author / Channel (Optional)
            </Label>
            <Input
              id="resource-author-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. FreeCodeCamp, Traversy Media"
              maxLength={120}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={bannerPreview ? undefined : "resource-banner-file-input"}
              className="text-xs sm:text-sm font-medium text-foreground/90"
            >
              Thumbnail (Optional)
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
                alt="Resource thumbnail preview"
                className="w-full h-full object-cover"
              />
              <Button
                id="clear-resource-banner-btn"
                type="button"
                variant="destructive"
                size="sm"
                onClick={clearBanner}
                className="absolute top-2.5 right-2.5 h-7 px-2.5 text-xs gap-1.5 shadow-md rounded-md bg-destructive/90 hover:bg-destructive text-destructive-foreground backdrop-blur-xs transition-transform active:scale-95"
                title="Delete thumbnail"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          ) : (
            <div
              id="resource-banner-dropzone"
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
                id="resource-banner-file-input"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="p-3 bg-muted/60 rounded-full mb-2 text-muted-foreground">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Click or drag thumbnail image
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
