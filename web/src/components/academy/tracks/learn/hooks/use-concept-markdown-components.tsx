"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Lightbulb, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

export function useConceptMarkdownComponents() {
  const components = useMemo(() => {
    const baseComponents: any = {
      code({ node, inline, className, children, ...props }: any) {
        const fullMatch = /language-(.+)/.exec(className || "");
        const isExercism =
          !inline && fullMatch && fullMatch[1].startsWith("exercism/");

        if (isExercism) {
          const type = fullMatch![1].split("/")[1]; // "advanced", "note", "caution"
          const isAdvanced = type === "advanced";
          const isCaution = type === "caution";

          const borderColor = isAdvanced
            ? "border-primary"
            : isCaution
              ? "border-destructive"
              : "border-secondary-foreground";
          const bgColor = isAdvanced
            ? "bg-card/60"
            : isCaution
              ? "bg-destructive/5"
              : "bg-card/60";
          const textColor = isAdvanced
            ? "text-primary"
            : isCaution
              ? "text-destructive"
              : "text-secondary-foreground";

          const Icon = isAdvanced ? Lightbulb : isCaution ? AlertTriangle : Info;
          const title = isAdvanced
            ? "Advanced Concept"
            : isCaution
              ? "Caution"
              : "Note";

          return (
            <Card className={`my-8 p-6 shadow-none ${bgColor}`}>
              <div
                className={`flex items-center gap-2 mb-4 font-bold text-lg ${textColor}`}
              >
                <Icon className="w-5 h-5" />
                <span>{title}</span>
              </div>
              <div className="prose dark:prose-invert max-w-none w-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={baseComponents}
                >
                  {String(children).replace(/\n$/, "")}
                </ReactMarkdown>
              </div>
            </Card>
          );
        }

        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <SyntaxHighlighter
            style={vscDarkPlus as any}
            language={match[1]}
            PreTag="div"
            className="rounded-lg overflow-hidden my-5 border bg-background w-full"
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              width: "100%",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              overflowX: "hidden",
            }}
            codeTagProps={{
              style: {
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                display: "block",
                maxWidth: "100%",
              },
            }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code
            className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono text-primary"
            {...props}
          >
            {children}
          </code>
        );
      },
      pre: ({ children }: any) => <>{children}</>,
      h1: ({ node, ...props }: any) => (
        <h2 className="text-3xl font-bold mt-12 mb-6 pb-2 border-b" {...props} />
      ),
      h2: ({ node, ...props }: any) => (
        <h3 className="text-2xl font-bold mt-10 mb-4" {...props} />
      ),
      h3: ({ node, ...props }: any) => (
        <h4 className="text-xl font-bold mt-8 mb-4" {...props} />
      ),
      a: ({ node, ...props }: any) => (
        <a
          className="text-primary hover:text-primary/80 underline font-medium inline-flex items-center gap-1 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {props.children}
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
      ul: ({ node, ...props }: any) => (
        <ul className="list-disc pl-6 my-4 space-y-2" {...props} />
      ),
      ol: ({ node, ...props }: any) => (
        <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
      ),
      p: ({ node, ...props }: any) => (
        <p className="leading-7 not-first:mt-6 text-foreground/90" {...props} />
      ),
    };
    return baseComponents;
  }, []);

  return components;
}
