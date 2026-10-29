"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { Separator } from "@/components/ui/separator";
import { MarkdownCodeBlock } from "./markdown-code-block";
import { cn } from "@/lib/utils";

// Import KaTeX CSS for math rendering
import "katex/dist/katex.min.css";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  preprocess?: (text: string) => string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  preprocess,
}) => {
  const processedContent = useMemo(() => {
    if (!content) return "";
    return preprocess ? preprocess(content) : content;
  }, [content, preprocess]);

  return (
    <div className={cn("markdown-renderer w-full", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold mb-4 text-primary" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <div className="mt-8 mb-4 group not-prose w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-2 rounded-full bg-primary shrink-0" />
                <h2
                  className="text-base font-bold tracking-tight text-primary uppercase"
                  {...props}
                />
              </div>
              <Separator className="bg-primary/20 h-px w-full" />
            </div>
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-sm font-bold text-primary mt-6 mb-3 border-l-4 border-primary pl-4 uppercase"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="text-sm leading-relaxed text-foreground/80 mb-4"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside space-y-2 mb-6 ml-4 text-sm text-foreground/80"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-2 mb-6 ml-4 text-sm text-foreground/80"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary/40 pl-4 italic my-4 text-muted-foreground text-sm"
              {...props}
            />
          ),
          pre: ({ children }: any) => <>{children}</>,
          code: ({ node, inline, className: codeClassName, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(codeClassName || "");
            return !inline ? (
              <MarkdownCodeBlock
                language={match ? match[1] : "text"}
                code={String(children)}
              />
            ) : (
              <code
                className="px-1.5 py-0.5 rounded-md bg-muted text-primary text-[12px] border border-border/40 shadow-none font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
