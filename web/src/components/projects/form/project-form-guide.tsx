"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/shared/markdown";

interface ProjectFormGuideProps {
  overview: string;
  setOverview: (value: string) => void;
  markdown: string;
  setMarkdown: (value: string) => void;
}

export function ProjectFormGuide({
  overview,
  setOverview,
  markdown,
  setMarkdown,
}: ProjectFormGuideProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Project Overview & Guide
          </h2>
          <p className="text-xs text-muted-foreground">
            Write comprehensive technical explanations, scaffolding instructions, and tips.
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="space-y-2">
        <Label
          htmlFor="project-overview-input"
          className="text-xs sm:text-sm font-medium text-foreground/90"
        >
          Detailed Overview (Optional)
        </Label>
        <Textarea
          id="project-overview-input"
          value={overview}
          onChange={(e) => setOverview(e.target.value)}
          placeholder="Deep dive into why this project is important and what real-world concepts it demonstrates..."
          className="min-h-62 leading-relaxed resize-y"
        />
      </div>

      {/* Markdown Guide */}
      <div className="space-y-2 pt-1">
        <Label
          htmlFor="project-markdown-editor"
          className="text-xs sm:text-sm font-medium text-foreground/90"
        >
          Full Project Guide (Markdown Supported)
        </Label>
        <MarkdownEditor
          id="project-markdown-editor"
          value={markdown}
          onChange={setMarkdown}
          placeholder={`# Getting Started\n\nExplain how to scaffold the application, recommended file structure, and step-by-step guidance.\n\n\`\`\`bash\nnpx create-next-app@latest my-app\n\`\`\``}
          defaultCodeLanguage="bash"
          minHeight="800px"
        />
      </div>
    </section>
  );
}
