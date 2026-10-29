"use client";

import React from "react";

export const MarkdownEditorStyles: React.FC = () => {
  return (
    <style jsx global>{`
      /* Fix EasyMDE / SimpleMDE for Dark Mode across Platform */
      .markdown-editor-root,
      .solution-editor-root {
        width: 100%;
      }

      .markdown-editor-root .editor-toolbar,
      .solution-editor-root .editor-toolbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: #0d0f12 !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px 6px 0 0;
        padding: 8px 12px;
      }

      .markdown-editor-root .editor-toolbar button,
      .solution-editor-root .editor-toolbar button {
        color: rgba(255, 255, 255, 0.7) !important;
        border: 1px solid transparent;
        border-radius: 6px;
        width: 34px;
        height: 34px;
        margin-right: 4px;
        transition: all 0.2s;
        cursor: pointer;
      }

      .markdown-editor-root .editor-toolbar button:hover,
      .solution-editor-root .editor-toolbar button:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        color: var(--primary) !important;
      }

      .markdown-editor-root .editor-toolbar button.active,
      .solution-editor-root .editor-toolbar button.active {
        background: var(--primary) !important;
        color: black !important;
        opacity: 1 !important;
        border-color: var(--primary) !important;
      }

      .markdown-editor-root .editor-toolbar i.separator,
      .solution-editor-root .editor-toolbar i.separator {
        border-left: 1px solid rgba(255, 255, 255, 0.15);
        margin: 0 10px;
      }

      .markdown-editor-root .CodeMirror,
      .solution-editor-root .CodeMirror {
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-top: none !important;
        background: #0F1217 !important;
        color: rgba(255, 255, 255, 0.95) !important;
        font-family: var(--font-mono), monospace;
        font-size: 14px;
        line-height: 1.7;
        border-radius: 0 0 8px 8px;
        padding: 16px;
        height: auto !important;
        min-height: var(--editor-min-height, 480px) !important;
      }

      .markdown-editor-root .CodeMirror-scroll,
      .solution-editor-root .CodeMirror-scroll {
        height: auto !important;
        min-height: var(--editor-min-height, 480px) !important;
        overflow: visible !important;
      }

      .markdown-editor-root .CodeMirror-cursor,
      .solution-editor-root .CodeMirror-cursor {
        border-left: 2px solid var(--primary) !important;
        opacity: 1 !important;
      }

      .markdown-editor-root .CodeMirror-selected,
      .solution-editor-root .CodeMirror-selected {
        background: #403d32 !important;
      }

      .markdown-editor-root .CodeMirror-selectedtext,
      .solution-editor-root .CodeMirror-selectedtext {
        color: white !important;
      }

      /* Syntax Highlighting in the Editor (Write Mode) */
      .markdown-editor-root .cm-header,
      .solution-editor-root .cm-header {
        color: var(--primary);
        font-weight: bold;
        font-size: 1.15em !important;
      }

      .markdown-editor-root .cm-quote,
      .solution-editor-root .cm-quote {
        color: #98c379;
        font-style: italic;
      }

      .markdown-editor-root .cm-keyword,
      .solution-editor-root .cm-keyword {
        color: #c678dd;
      }

      .markdown-editor-root .cm-atom,
      .solution-editor-root .cm-atom {
        color: #d19a66;
      }

      .markdown-editor-root .cm-number,
      .solution-editor-root .cm-number {
        color: #d19a66;
      }

      .markdown-editor-root .cm-def,
      .solution-editor-root .cm-def {
        color: #61afef;
      }

      .markdown-editor-root .cm-variable,
      .solution-editor-root .cm-variable {
        color: #e06c75;
      }

      .markdown-editor-root .cm-property,
      .solution-editor-root .cm-property {
        color: #61afef;
      }

      .markdown-editor-root .cm-operator,
      .solution-editor-root .cm-operator {
        color: #56b6c2;
      }

      /* Code inside code blocks and inline code (CodeMirror markdown mode maps code to cm-comment) */
      .markdown-editor-root .cm-comment,
      .solution-editor-root .cm-comment {
        color: #009490 !important;
        font-style: normal !important;
      }

      /* Markdown code delimiters (fenced blocks and inline code) */
      .markdown-editor-root .cm-formatting-code-block,
      .solution-editor-root .cm-formatting-code-block,
      .markdown-editor-root .cm-formatting-code,
      .solution-editor-root .cm-formatting-code {
        color: #8b949e !important;
        font-style: normal !important;
      }

      .markdown-editor-root .cm-string,
      .solution-editor-root .cm-string {
        color: #98c379;
      }

      .markdown-editor-root .cm-meta,
      .solution-editor-root .cm-meta {
        color: #c678dd;
      }

      .markdown-editor-root .cm-tag,
      .solution-editor-root .cm-tag {
        color: #e06c75;
      }

      .markdown-editor-root .cm-attribute,
      .solution-editor-root .cm-attribute {
        color: #d19a66;
      }

      .markdown-editor-root .cm-link,
      .solution-editor-root .cm-link {
        color: var(--primary);
        text-decoration: underline;
      }

      /* Preview Panel */
      .markdown-editor-root .editor-preview-active-side,
      .markdown-editor-root .editor-preview-active,
      .solution-editor-root .editor-preview-active-side,
      .solution-editor-root .editor-preview-active {
        background: #0F1217 !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        padding: 24px !important;
        min-height: var(--editor-min-height, 480px) !important;
      }

      /* Manual Prose Overrides for Preview Accuracy */
      .markdown-editor-root .editor-preview h1,
      .solution-editor-root .editor-preview h1 {
        font-size: 1.85rem !important;
        font-weight: 800 !important;
        margin-top: 2rem !important;
        margin-bottom: 1.25rem !important;
        color: white !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.5rem;
        line-height: 1.2;
      }
      .markdown-editor-root .editor-preview h1:first-child,
      .solution-editor-root .editor-preview h1:first-child {
        margin-top: 0 !important;
      }
      .markdown-editor-root .editor-preview h2,
      .solution-editor-root .editor-preview h2 {
        font-size: 1.35rem !important;
        font-weight: 700 !important;
        margin-top: 2rem !important;
        margin-bottom: 1rem !important;
        color: white !important;
        border-left: 4px solid var(--primary);
        padding-left: 12px;
        line-height: 1.3;
      }
      .markdown-editor-root .editor-preview h3,
      .solution-editor-root .editor-preview h3 {
        font-size: 1.15rem !important;
        font-weight: 600 !important;
        margin-top: 1.5rem !important;
        margin-bottom: 0.75rem !important;
        color: rgba(255, 255, 255, 0.95) !important;
      }
      .markdown-editor-root .editor-preview p,
      .solution-editor-root .editor-preview p {
        margin-top: 1rem !important;
        margin-bottom: 1rem !important;
        line-height: 1.75 !important;
        color: rgba(255, 255, 255, 0.85) !important;
      }
      .markdown-editor-root .editor-preview strong,
      .solution-editor-root .editor-preview strong {
        font-weight: 800 !important;
        color: var(--primary) !important;
      }
      .markdown-editor-root .editor-preview ul,
      .markdown-editor-root .editor-preview ol,
      .solution-editor-root .editor-preview ul,
      .solution-editor-root .editor-preview ol {
        padding-left: 1.5rem !important;
        margin-top: 1rem !important;
        margin-bottom: 1rem !important;
        list-style: disc !important;
      }
      .markdown-editor-root .editor-preview li,
      .solution-editor-root .editor-preview li {
        margin-bottom: 0.5rem !important;
        line-height: 1.6 !important;
      }
      .markdown-editor-root .editor-preview p > code,
      .markdown-editor-root .editor-preview li > code,
      .markdown-editor-root .editor-preview blockquote > code,
      .solution-editor-root .editor-preview p > code,
      .solution-editor-root .editor-preview li > code,
      .solution-editor-root .editor-preview blockquote > code {
        background: rgba(var(--primary-rgb, 234, 179, 8), 0.15) !important;
        padding: 2px 6px !important;
        border-radius: 4px !important;
        font-family: var(--font-mono), monospace !important;
        color: var(--primary) !important;
        font-size: 0.88em;
      }
      .markdown-editor-root .editor-preview .group\/code code,
      .solution-editor-root .editor-preview .group\/code code,
      .markdown-editor-root .editor-preview pre code,
      .solution-editor-root .editor-preview pre code,
      .group\/code code {
        background: transparent !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      .markdown-editor-root .editor-preview blockquote,
      .solution-editor-root .editor-preview blockquote {
        border-left: 4px solid rgba(255, 255, 255, 0.2) !important;
        background: rgba(255, 255, 255, 0.03);
        padding: 1rem 1.5rem !important;
        margin: 1.5rem 0 !important;
        border-radius: 0 8px 8px 0;
        font-style: italic !important;
        color: rgba(255, 255, 255, 0.7) !important;
      }
      .markdown-editor-root .editor-preview pre,
      .solution-editor-root .editor-preview pre {
        background: transparent !important;
        padding: 0 !important;
        border-radius: 0 !important;
        border: none !important;
        margin: 1.25rem 0 !important;
        overflow-x: auto !important;
      }
      .markdown-editor-root .editor-preview pre code,
      .solution-editor-root .editor-preview pre code {
        background: transparent !important;
        padding: 0 !important;
      }

      .markdown-editor-root .editor-statusbar,
      .solution-editor-root .editor-statusbar {
        padding: 8px 16px;
        color: rgba(255, 255, 255, 0.3) !important;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .editor-toolbar.fullscreen,
      .CodeMirror-fullscreen {
        z-index: 1000 !important;
        background: #09090b !important;
      }

      /* Side-by-Side Mode Optimization */
      .markdown-editor-root .CodeMirror-sided,
      .solution-editor-root .CodeMirror-sided {
        width: 50% !important;
        border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      .markdown-editor-root .editor-preview-side,
      .solution-editor-root .editor-preview-side {
        width: 50% !important;
        background: #0d0f12 !important;
        border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
        z-index: 40 !important;
        position: fixed !important;
        top: auto !important;
        bottom: 0 !important;
        right: 0 !important;
        height: auto !important;
      }
      .markdown-editor-root .editor-toolbar.sided,
      .solution-editor-root .editor-toolbar.sided {
        width: 100% !important;
        border-radius: 4px 4px 0 0 !important;
      }
    `}</style>
  );
};
