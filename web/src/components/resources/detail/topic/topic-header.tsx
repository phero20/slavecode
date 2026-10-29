"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TopicHeaderProps {
  title: string;
  legend?: {
    label?: string;
    color?: string;
  };
  tone?: {
    accent?: string;
  };
}

export function TopicHeader({ title, legend, tone }: TopicHeaderProps) {
  return (
    <div className="mb-3">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">
        {title}
      </h1>
      {/* {legend?.label && (
        <p className={cn("text-sm font-medium mt-1", tone?.accent)}>
          {legend.label}
        </p>
      )} */}
    </div>
  );
}

export default TopicHeader;
