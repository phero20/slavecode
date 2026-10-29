"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { tones } from "@/lib/tones";

interface SubtopicNodeData {
  label: string;
  style?: Record<string, unknown>;
  legend?: {
    id?: string;
    color?: string;
    label?: string;
  };
  isLearned?: boolean;
}

function hashLabel(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const SubtopicNode = memo(({ id, data, selected }: NodeProps<SubtopicNodeData>) => {
  const tone = tones[hashLabel(data.label || id) % tones.length];
  const legendColor = data?.legend?.color;
  const isLearned = data?.isLearned;

  return (
    <div
      id={`roadmap-subtopic-${id}`}
      className={cn(
        // roadmap.sh: dark rounded pill, slightly lighter than background
        "group relative flex items-center justify-center text-center px-2.5 py-1 rounded-md font-medium text-[11px] tracking-tight leading-snug select-none cursor-pointer w-full h-full transition-all duration-150",
        isLearned
          ? cn("border", tones[1].chipBorder, tones[1].chipBg, tones[1].accent)
          : "border border-border/70 bg-card/80 text-muted-foreground hover:text-foreground hover:border-opacity-80",
        "hover:scale-[1.02]",
        selected && ["border-2", tone.chipBorder, "text-foreground"]
      )}
      style={{
        minWidth: 90,
        minHeight: 30,
        // Subtle tone tint on hover via CSS — no hardcoded hex
        borderColor: isLearned ? undefined : tone.fill + "55",
      }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} id="y1" className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="source" position={Position.Top} id="y2" className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="target" position={Position.Top} className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="target" position={Position.Bottom} id="z1" className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="z2" className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="target" position={Position.Left} id="w1" className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="source" position={Position.Left} id="w2" className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="target" position={Position.Left} className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="target" position={Position.Right} id="x1" className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="source" position={Position.Right} id="x2" className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />
      <Handle type="source" position={Position.Right} className="opacity-0 !w-1.5 !h-1.5 pointer-events-none" />

      {/* Legend color dot */}
      {legendColor && (
        <span
          className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-background shrink-0 z-10"
          style={{ backgroundColor: legendColor }}
          title={data.legend?.label}
        />
      )}

      {/* Subtopic Label */}
      <span className="line-clamp-2 leading-tight">{data.label}</span>
    </div>
  );
});

SubtopicNode.displayName = "SubtopicNode";
