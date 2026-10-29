"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MarkdownCodeBlockProps {
  language: string;
  code: string;
}

export const MarkdownCodeBlock: React.FC<MarkdownCodeBlockProps> = ({
  language,
  code,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="relative group/code overflow-hidden border-border/40 my-6 not-prose bg-muted/30 shadow-none">
      <div className="bg-muted px-4 py-1.5 border-b border-border/40 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {language || "text"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-code-copy-btn="true"
          data-code={encodeURIComponent(code)}
          className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
          onClick={handleCopy}
          title="Copy code"
        >
          <Check
            className={cn(
              "size-3 text-difficulty-easy icon-check",
              !copied && "hidden"
            )}
          />
          <Copy
            className={cn(
              "size-3 icon-copy",
              copied && "hidden"
            )}
          />
        </Button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.8rem",
          lineHeight: "1.6",
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
            background: "transparent",
          },
        }}
      >
        {code.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </Card>
  );
};
