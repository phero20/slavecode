"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { tones } from "@/lib/tones";

interface TopicNodeData {
  label: string;
  style?: Record<string, unknown>;
  legend?: {
    id?: string;
    color?: string;
    label?: string;
    position?: string;
  };
  isLearned?: boolean;
}

// Deterministic tone from label
function hashLabel(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const TopicNode = memo(({ id, data, selected }: NodeProps<TopicNodeData>) => {
  const tone = tones[hashLabel(data.label || id) % tones.length];
  const legendColor = data?.legend?.color;
  const isLearned = data?.isLearned;

  return (
    <div
      id={`roadmap-node-${id}`}
      className={cn(
        "group relative flex items-center justify-center text-center px-3 py-2 rounded-md font-bold text-[13px] tracking-tight leading-snug select-none cursor-pointer w-full h-full transition-all duration-150",
        // roadmap.sh style: filled background with tone color
        isLearned
          ? cn(tones[1].chipBg, "border-2", tones[1].chipBorder, tones[1].accent)
          : [tone.chipBg, "border-2", tone.chipBorder, "text-foreground"],
        "hover:scale-[1.03] hover:shadow-md",
        selected && ["ring-2", `ring-offset-1`, tone.chipBorder, "scale-[1.02]"]
      )}
      style={{
        minWidth: 120,
        minHeight: 40,
        // Inline filled background matching roadmap.sh solid yellow/green/blue fill
        backgroundColor: isLearned ? undefined : tone.fill + "22",
        borderColor: isLearned ? undefined : tone.fill + "99",
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

      {/* Legend color dot — matches roadmap.sh small circle on corner */}
      {legendColor && (
        <span
          className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full ring-2 ring-background shadow-xs shrink-0 z-10"
          style={{ backgroundColor: legendColor }}
          title={data.legend?.label}
        />
      )}

      {/* Node Label */}
      <span className="line-clamp-2 leading-tight" style={{ color: isLearned ? undefined : tone.fill }}>
        {data.label}
      </span>
    </div>
  );
});

TopicNode.displayName = "TopicNode";
