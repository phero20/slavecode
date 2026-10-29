"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { MarkdownCodeBlock } from "@/components/shared/markdown/markdown-code-block";
import type { RoadmapProjectItem } from "@/types/project";

export function ProjectGuide({ project }: { project: RoadmapProjectItem }) {
  const content = project.content?.markdown;

  if (!content) {
    return (
      <div className="py-16 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/5">
        <p className="text-sm">
          No implementation guide provided for this project yet.
        </p>
      </div>
    );
  }

  return (
    <article className="w-full min-w-0 max-w-[850px] mx-auto py-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w]+/g, "-");
            return (
              <h2
                id={id}
                className="text-2xl sm:text-3xl font-extrabold mt-14 first:mt-0 mb-6 text-foreground tracking-tight scroll-m-24 flex items-center gap-3 pb-3 border-b border-border/60"
                {...props}
              >
                <span>{children}</span>
              </h2>
            );
          },
          h2: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w]+/g, "-");
            return (
              <h3
                id={id}
                className="text-xl sm:text-2xl font-bold mt-12 first:mt-0 mb-4 text-foreground tracking-tight scroll-m-24 border-l-4 border-primary pl-3.5"
                {...props}
              >
                {children}
              </h3>
            );
          },
          h3: ({ node, children, ...props }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w]+/g, "-");
            return (
              <h4
                id={id}
                className="text-lg sm:text-xl font-semibold mt-8 first:mt-0 mb-3 text-foreground/90 tracking-tight scroll-m-24"
                {...props}
              >
                {children}
              </h4>
            );
          },
          p: ({ node, ...props }) => (
            <p
              className="text-[17px] leading-relaxed mb-6 text-muted-foreground"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc pl-6 mb-6 text-muted-foreground space-y-2 text-[17px] marker:text-primary"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-6 mb-6 text-muted-foreground space-y-2 text-[17px] marker:text-primary"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-1" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary font-medium hover:underline decoration-primary/50 underline-offset-4 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          pre: ({ children }: any) => <>{children}</>,
          code: ({ node, inline, className, children, ...props }: any) => {
            const rawContent = String(children).replace(/\n$/, "");
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = !inline && (Boolean(match) || String(children).includes("\n"));

            if (isBlock) {
              return (
                <MarkdownCodeBlock
                  language={match ? match[1] : "text"}
                  code={rawContent}
                />
              );
            }

            return (
              <code
                className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[13.5px] font-mono border border-primary/20 font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-[4px] border-primary/50 pl-6 bg-secondary/5 rounded-r-xl italic text-muted-foreground/90 my-8 py-3 pr-4 text-[17px]"
              {...props}
            />
          ),
          img: ({ node, ...props }) => (
            <img
              width={100}
              height={100}
              className="rounded-xl border border-border/50 my-8 max-w-full h-auto shadow-sm"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-12 border-border/40" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto my-8 border border-border/50 rounded-xl">
              <table
                className="w-full text-left border-collapse text-sm"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="bg-secondary/30 p-4 font-semibold text-foreground border-b border-border/50"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="p-4 border-b border-border/40 text-muted-foreground last:border-0"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
