"use client";

import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { tones } from "@/lib/tones";

interface LegendItem {
  id?: string;
  color: string;
  label: string;
}

interface LegendNodeData {
  legends?: LegendItem[];
}

// Legend uses the first tone accent for the label heading
const labelTone = tones[0];

export const LegendNode = memo(({ id, data }: NodeProps<LegendNodeData>) => {
  const legends = data?.legends || [];

  if (legends.length === 0) return null;

  return (
    <div
      id={`roadmap-legend-${id}`}
      className="p-3.5 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xs shadow-sm flex flex-col gap-2 select-none"
      style={{ minWidth: 220 }}
    >
      {/* "LEGEND" heading using tone accent color */}
      <div className={`text-[10px] uppercase font-bold tracking-widest ${labelTone.accent} opacity-80`}>
        Legend
      </div>

      <div className="flex flex-col gap-1.5">
        {legends.map((item, idx) => (
          <div key={item.id || idx} className="flex items-center gap-2 text-xs">
            {/* Each legend dot uses its own stored color from the roadmap data */}
            <span
              className="h-3 w-3 rounded-full shrink-0 shadow-2xs ring-1 ring-border/30"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-foreground/90 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

LegendNode.displayName = "LegendNode";
