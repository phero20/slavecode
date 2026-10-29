"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { tones } from "@/lib/tones";

interface ButtonNodeData {
  label: string;
  href?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  width?: number;
  height?: number;
}

// roadmap.sh button nodes are light rounded pill CTAs (e.g. "Visit Beginner Friendly Version ↗")
// We use the first tone (yellow) as the base for button styling
const buttonTone = tones[0]; // yellow

export const ButtonNode = memo(({ id, data }: NodeProps<ButtonNodeData>) => {
  const isExternal = data.href?.startsWith("http");
  const href = data.href
    ? isExternal
      ? data.href
      : data.href.startsWith("/resources")
      ? data.href
      : `/resources${data.href.startsWith("/") ? "" : "/"}${data.href}`
    : "#";

  return (
    <div
      id={`roadmap-btn-${id}`}
      className={cn(
        "group relative flex items-center justify-center text-center px-5 py-2.5 rounded-full font-semibold text-[12px] tracking-wide transition-all select-none shadow-xs cursor-pointer",
        // roadmap.sh uses a light grey/white filled pill for CTA buttons
        "bg-muted/60 border border-border/70 text-foreground hover:border-opacity-100 hover:shadow-sm hover:scale-[1.02]",
        buttonTone.ring
      )}
      style={{
        minWidth: data.width ? `${data.width}px` : undefined,
        minHeight: data.height ? `${data.height}px` : undefined,
      }}
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

      {data.href ? (
        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          className="flex items-center gap-1.5 no-underline text-inherit"
        >
          <span>{data.label}</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </Link>
      ) : (
        <span>{data.label}</span>
      )}
    </div>
  );
});

ButtonNode.displayName = "ButtonNode";
