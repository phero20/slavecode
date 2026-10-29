"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { tones } from "@/lib/tones";

interface GuideNodeData {
  width?: number;
  height?: number;
  style?: {
    strokeDasharray?: string;
    strokeWidth?: number;
    stroke?: string;
    strokeLinecap?: string;
  };
}

// GuideNode renders connector lines (vertical/horizontal dashed separators)
// Use tone fill colors for stroke instead of hardcoded blue
// We cycle through all 3 tones using a stable index based on whether it's vertical or horizontal

export const GuideNode = memo(({ id, data, type }: NodeProps<GuideNodeData>) => {
  const isVertical = type === "vertical";

  // Use the data-provided stroke if it exists (from MongoDB), otherwise fall back to tone color
  const tone = tones[0]; // guides use the first tone (yellow/gold) as primary
  const strokeColor = data?.style?.stroke || tone.fill;
  const strokeWidth = data?.style?.strokeWidth || 3;
  const strokeDash = data?.style?.strokeDasharray || "0.8 8";

  const width = data?.width || (isVertical ? 20 : 200);
  const height = data?.height || (isVertical ? 160 : 20);

  return (
    <div
      id={`roadmap-guide-${id}`}
      className="relative pointer-events-none flex items-center justify-center select-none"
      style={{ width, height }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} id="y1" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="source" position={Position.Top} id="y2" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="target" position={Position.Bottom} id="z1" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="z2" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="target" position={Position.Left} id="w1" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="source" position={Position.Left} id="w2" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="target" position={Position.Right} id="x1" className="opacity-0 !w-1 !h-1 pointer-events-none" />
      <Handle type="source" position={Position.Right} id="x2" className="opacity-0 !w-1 !h-1 pointer-events-none" />

      {/* SVG Separator Line */}
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isVertical ? (
          <line
            x1={width / 2}
            y1={0}
            x2={width / 2}
            y2={height}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
            strokeLinecap="round"
          />
        ) : (
          <line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
});

GuideNode.displayName = "GuideNode";
