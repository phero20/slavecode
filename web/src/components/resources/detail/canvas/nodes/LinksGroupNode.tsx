"use client";

import React, { memo } from "react";
import { NodeProps } from "reactflow";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { tones } from "@/lib/tones";

interface LinkItem {
  id: string;
  label: string;
  url?: string;
  href?: string;
}

interface LinksGroupNodeData {
  label: string;
  links: LinkItem[];
  width?: number;
  height?: number;
}

// Use the second tone (emerald) for the links group accent
const linksTone = tones[1];

export const LinksGroupNode = memo(({ id, data }: NodeProps<LinksGroupNodeData>) => {
  const links = data?.links || [];

  return (
    <div
      id={`roadmap-linksgroup-${id}`}
      className={cn(
        "p-4 rounded-xl border bg-card/90 backdrop-blur-xs shadow-sm flex flex-col gap-2.5 select-none",
        linksTone.chipBorder
      )}
      style={{
        width: data?.width ? `${data.width}px` : "auto",
        minWidth: 260,
        borderColor: linksTone.fill + "50",
      }}
    >
      {/* Section heading with tone accent */}
      <div className={cn("text-[10px] uppercase font-bold tracking-widest opacity-80", linksTone.accent)}>
        {data?.label || "Related Roadmaps"}
      </div>

      <div className="flex flex-col gap-1.5">
        {links.map((link) => {
          const rawUrl = link.url || link.href || "";
          const isExternal = rawUrl.startsWith("http");
          let href = rawUrl;
          if (rawUrl.includes("roadmap.sh/")) {
            const parts = rawUrl.split("roadmap.sh/");
            if (parts[1]) href = `/resources/${parts[1]}`;
          }

          return (
            <Link
              key={link.id}
              href={href}
              target={isExternal && !href.startsWith("/resources") ? "_blank" : undefined}
              className={cn(
                "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:text-foreground transition-all group",
                "hover:bg-muted/50",
                linksTone.hoverAccent
              )}
            >
              <span>{link.label}</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
});

LinksGroupNode.displayName = "LinksGroupNode";
