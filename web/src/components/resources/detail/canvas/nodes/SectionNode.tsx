"use client";

import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { tones } from "@/lib/tones";

interface SectionNodeData {
  label?: string;
  width?: number;
  height?: number;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: string;
  };
}

// roadmap.sh uses dashed grouping containers with very subtle background
// We use a tone-derived dashed border for visual grouping

export const SectionNode = memo(({ id, data }: NodeProps<SectionNodeData>) => {
  const width = data?.width;
  const height = data?.height;

  // Determine which tone to use based on label
  const tone = tones[0]; // sections are structural, use neutral first tone as accent

  return (
    <div
      id={`roadmap-section-${id}`}
      className={cn(
        "rounded-xl border border-dashed bg-transparent pointer-events-none p-3 relative flex flex-col justify-start"
      )}
      style={{
        width: width ? `${width}px` : "auto",
        height: height ? `${height}px` : "auto",
        // Use tone fill at very low opacity for the dashed border tint
        borderColor: tone.fill + "40",
        backgroundColor: tone.fill + "06",
      }}
    >
      {data?.label && (
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider opacity-60", tone.accent)}>
          {data.label}
        </span>
      )}
    </div>
  );
});

SectionNode.displayName = "SectionNode";
