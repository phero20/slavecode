"use client";

import React, { useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import ReactDOMServer from "react-dom/server";
import { MarkdownEditorStyles } from "./markdown-editor-styles";
import { MarkdownRenderer } from "./markdown-renderer";
import { cn } from "@/lib/utils";

// Import EasyMDE core CSS
import "easymde/dist/easymde.min.css";

// Dynamic import SimpleMDE to prevent SSR window/navigator errors
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  defaultCodeLanguage?: string;
  autofocus?: boolean;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  id,
  value,
  onChange,
  placeholder = "Write markdown guide...",
  minHeight = "480px",
  defaultCodeLanguage = "bash",
  autofocus = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const copyBtn = target?.closest<HTMLButtonElement>("[data-code-copy-btn]");
      if (!copyBtn) return;

      e.preventDefault();
      e.stopPropagation();

      let codeToCopy = "";
      const rawCode = copyBtn.getAttribute("data-code");
      if (rawCode) {
        try {
          codeToCopy = decodeURIComponent(rawCode);
        } catch {
          codeToCopy = rawCode;
        }
      }
      if (!codeToCopy) {
        const card = copyBtn.closest(".group\\/code");
        const codeEl = card?.querySelector("code");
        if (codeEl) {
          codeToCopy = codeEl.innerText || codeEl.textContent || "";
        }
      }

      if (!codeToCopy) return;

      navigator.clipboard.writeText(codeToCopy).then(() => {
        const copyIcon = copyBtn.querySelector(".icon-copy");
        const checkIcon = copyBtn.querySelector(".icon-check");
        if (copyIcon && checkIcon) {
          copyIcon.classList.add("hidden");
          checkIcon.classList.remove("hidden");
          setTimeout(() => {
            copyIcon.classList.remove("hidden");
            checkIcon.classList.add("hidden");
          }, 2000);
        }
      }).catch((err) => {
        console.error("Failed to copy code to clipboard:", err);
      });
    };

    container.addEventListener("click", handleClick);
    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, []);

  const mdeOptions = useMemo(() => {
    return {
      autofocus,
      spellChecker: false,
      placeholder,
      status: ["lines", "words"] as any,
      minHeight,
      renderingConfig: {
        singleLineBreaks: true,
        codeSyntaxHighlighting: true,
      },
      toolbarSticky: false,
      previewRender: (plainText: string) => {
        return ReactDOMServer.renderToString(
          <div className="p-4 bg-muted/10">
            <MarkdownRenderer content={plainText} />
          </div>
        );
      },
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        {
          name: "code",
          action: (editor: any) => {
            const cm = editor.codemirror;
            const selection = cm.getSelection();
            const text = selection || "// code snippet here";
            cm.replaceSelection(
              "```" + defaultCodeLanguage + "\n" + text + "\n```"
            );
          },
          className: "fa fa-code",
          title: `Code Block (${defaultCodeLanguage})`,
        },
        "|",
        "preview",
      ] as any,
      shortcuts: {
        toggleFullScreen: null,
      },
    };
  }, [autofocus, placeholder, minHeight, defaultCodeLanguage]);

  return (
    <div
      ref={containerRef}
      className={cn("markdown-editor-root w-full", className)}
      style={{ "--editor-min-height": minHeight } as React.CSSProperties}
    >
      <MarkdownEditorStyles />
      <SimpleMDE id={id} value={value} onChange={onChange} options={mdeOptions as any} />
    </div>
  );
};
