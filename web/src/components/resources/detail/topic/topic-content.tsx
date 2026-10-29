"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMarkdownComponents } from "./hooks";

interface TopicContentProps {
  description?: string;
}

export function TopicContent({ description }: TopicContentProps) {
  const components = useMarkdownComponents();

  if (!description) return null;

  return (
    <div className="prose dark:prose-invert max-w-none w-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {description}
      </ReactMarkdown>
    </div>
  );
}

export default TopicContent;
