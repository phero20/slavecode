"use client";

import React from "react";
import { Image as ImageIcon, UploadCloud, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectFormBannerProps {
  bannerPreview: string | null;
  isDragActive: boolean;
  handleBannerDrag: (e: React.DragEvent) => void;
  handleBannerDrop: (e: React.DragEvent) => void;
  handleBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearBanner: () => void;
}

export function ProjectFormBanner({
  bannerPreview,
  isDragActive,
  handleBannerDrag,
  handleBannerDrop,
  handleBannerChange,
  clearBanner,
}: ProjectFormBannerProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Project Banner (Optional)
          </h2>
          <p className="text-xs text-muted-foreground">
            Add a screenshot, mockup, or banner preview for cards and project headers.
          </p>
        </div>
      </div>

      {bannerPreview ? (
        <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-border shadow-xs bg-muted/20 group">
          <img
            src={bannerPreview}
            alt="Project banner preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              id="clear-banner-btn"
              type="button"
              variant="destructive"
              size="sm"
              onClick={clearBanner}
              className="h-8 px-3 text-xs gap-1.5 shadow-md"
              title="Remove banner image"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Banner
            </Button>
          </div>
        </div>
      ) : (
        <div
          id="banner-dropzone"
          onDragEnter={handleBannerDrag}
          onDragLeave={handleBannerDrag}
          onDragOver={handleBannerDrag}
          onDrop={handleBannerDrop}
          className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/70 hover:border-primary/50 hover:bg-muted/20"
          }`}
        >
          <input
            id="banner-file-input"
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="p-3 bg-muted/60 rounded-full mb-2.5 text-muted-foreground">
            <UploadCloud className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Click to upload or drag & drop image
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            PNG, JPG, WebP or SVG (Up to 10MB)
          </p>
        </div>
      )}
    </section>
  );
}
