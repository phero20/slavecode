"use client";

import React from "react";
import { MarkdownRenderer } from "@/components/shared/markdown";

interface SolutionMarkdownProps {
  content: string;
  isOfficial?: boolean;
}

export const SolutionMarkdown: React.FC<SolutionMarkdownProps> = ({ 
  content, 
  isOfficial = false 
}) => {
  const processContent = (text: string) => {
    if (!isOfficial) return text;
    
    // Legacy official solution processing
    return text
      .replace(/\[TOC\]/g, "")
      .replace(/---## Solution/g, "## Solution")
      .replace(/!\?\!.*?\?\!/g, "")
      .replace(/\{:.*?\}/g, "")
      .replace(/([^\n])(#{1,6}\s)/g, "$1\n$2")
      .trim();
  };

  return (
    <MarkdownRenderer
      content={content}
      preprocess={isOfficial ? processContent : undefined}
    />
  );
};
