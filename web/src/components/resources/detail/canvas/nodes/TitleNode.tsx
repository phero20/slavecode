"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { tones } from "@/lib/tones";

interface TitleNodeData {
  label: string;
  style?: Record<string, unknown>;
}

function hashLabel(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const TitleNode = memo(({ id, data, type }: NodeProps<TitleNodeData>) => {
  const isParagraph = type === "paragraph" || type === "label";
  const tone = tones[hashLabel(data.label || id) % tones.length];

  return (
    <div
      id={`roadmap-title-${id}`}
      className={cn(
        "relative select-none pointer-events-auto",
        isParagraph
          ? "text-xs sm:text-sm text-muted-foreground/80 max-w-sm leading-relaxed"
          : cn("font-black text-xl sm:text-3xl tracking-widest uppercase", tone.accent)
      )}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} id="y1" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="source" position={Position.Top} id="y2" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="target" position={Position.Bottom} id="z1" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="z2" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="target" position={Position.Left} id="w1" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="source" position={Position.Left} id="w2" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="target" position={Position.Right} id="x1" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="source" position={Position.Right} id="x2" className="opacity-0 !w-1 !h-1 pointer-events-none" />

      <span>{data?.label}</span>
    </div>
  );
});

TitleNode.displayName = "TitleNode";
