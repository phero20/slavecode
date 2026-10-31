"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Hero } from "../Hero";
import CompilerSection from "../compilers/compilerVisual";
import AcademyHome from "../academy/AcademyHome";
import { RoadmapHomeSection } from "../roadmap/RoadmapHomeSection";
import ResourcesHome from "../resources/ResourcesHome";
import ProjectsHomeSection from "../projects/ProjectsHomeSection";
import SystemdesignHome from "../systemdesign/SystemdesignHome";
import ArenaHome from "../Arena/ArenaHome";

interface EmbedWrapperProps {
  section: string;
  children: React.ReactNode;
}

/**
 * Isolated wrapper for embedded sections.
 * Automatically synchronizes scrollHeight with parent window (e.g. CSI resources page) via postMessage.
 */
export function EmbedWrapper({ section, children }: EmbedWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number>(0);

  // Eliminate all window/document scrollbars when rendered inside an iframe
  useEffect(() => {
    if (typeof window === "undefined" || window.self === window.top) return;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollbarWidth = "none";
    document.body.style.scrollbarWidth = "none";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.style.scrollbarWidth = "";
      document.body.style.scrollbarWidth = "";
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || window.self === window.top) return;

    const sendHeight = () => {
      if (!containerRef.current) return;
      const height =
        containerRef.current.scrollHeight || containerRef.current.offsetHeight;
      if (height > 0 && Math.abs(height - lastHeightRef.current) > 8) {
        lastHeightRef.current = Math.ceil(height);
        window.parent.postMessage(
          {
            type: "SECTION_HEIGHT",
            section,
            height: Math.ceil(height),
          },
          "*"
        );
      }
    };

    sendHeight();

    const ro = new ResizeObserver(() => {
      sendHeight();
    });

    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    const timers = [100, 300, 600, 1000, 1500].map((t) =>
      setTimeout(sendHeight, t)
    );

    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [section]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-background overflow-hidden min-h-0 h-auto"
    >
      {children}
    </div>
  );
}

/**
 * Hook to manage isolated embed rendering (?embed=<sectionId>) and height reporting.
 */
export function useHomeEmbed() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed")?.toLowerCase();

  let embeddedSection: React.ReactNode = null;

  if (embed) {
    if (embed === "hero" || embed === "more") {
      embeddedSection = (
        <EmbedWrapper section="hero">
          <Hero isEmbedded={true} />
        </EmbedWrapper>
      );
    } else if (embed === "academy") {
      embeddedSection = (
        <EmbedWrapper section="academy">
          <AcademyHome />
        </EmbedWrapper>
      );
    } else if (embed === "roadmap" || embed === "dsa") {
      embeddedSection = (
        <EmbedWrapper section="roadmap">
          <RoadmapHomeSection />
        </EmbedWrapper>
      );
    } else if (embed === "resources" || embed === "roadmaps") {
      embeddedSection = (
        <EmbedWrapper section="resources">
          <ResourcesHome />
        </EmbedWrapper>
      );
    } else if (embed === "systemdesign") {
      embeddedSection = (
        <EmbedWrapper section="systemdesign">
          <SystemdesignHome />
        </EmbedWrapper>
      );
    } else if (embed === "projects") {
      embeddedSection = (
        <EmbedWrapper section="projects">
          <ProjectsHomeSection />
        </EmbedWrapper>
      );
    } else if (embed === "compilers" || embed === "compiler") {
      embeddedSection = (
        <EmbedWrapper section="compilers">
          <CompilerSection />
        </EmbedWrapper>
      );
    } else if (embed === "arena") {
      embeddedSection = (
        <EmbedWrapper section="arena">
          <ArenaHome />
        </EmbedWrapper>
      );
    }
  }

  return {
    isEmbedded: Boolean(embeddedSection),
    embedParam: embed,
    embeddedSection,
  };
}

