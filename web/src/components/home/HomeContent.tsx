"use client";

import { useEffect } from "react";
import { Hero } from "./Hero";
import CompilerSection from "./compilers/compilerVisual";
import AcademyHome from "./academy/AcademyHome";
import { RoadmapHomeSection } from "./roadmap/RoadmapHomeSection";
import ResourcesHome from "./resources/ResourcesHome";
import ProjectsHomeSection from "./projects/ProjectsHomeSection";
import { CompaniesHomeSection } from "./companies/CompaniesHomeSection";
import SystemdesignHome from "./systemdesign/SystemdesignHome";
import ArenaHome from "./Arena/ArenaHome";
import ContestsHome from "./contests/ContestsHome";
import { CTASection } from "./CTASection";

export const HomeContent = () => {
  // Sync section height with parent iframe container when embedded
  useEffect(() => {
    // Only run if running inside an iframe (e.g., embedded in CSI)
    if (typeof window === "undefined" || window.self === window.top) return;

    // If an anchor hash is present, ensure it snaps to that section
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      }
    }

    const sectionIds = [
      "hero",
      "academy",
      "roadmap",
      "resources",
      "projects",
      "companies",
      "systemdesign",
      "arena",
      "contests",
      "compilers",
      "cta",
    ];

    const sendHeight = (id: string, height: number) => {
      window.parent.postMessage(
        {
          type: "SECTION_HEIGHT",
          section: id,
          height: Math.ceil(height),
        },
        "*"
      );
    };

    const observers: ResizeObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      // Send initial height
      if (el.offsetHeight > 0) {
        sendHeight(id, el.offsetHeight);
      }

      // Observe dynamic height changes (images, responsive layout, hydration)
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const currentHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          if (currentHeight > 0) {
            sendHeight(id, currentHeight);
          }
        }
      });

      ro.observe(el);
      observers.push(ro);
    });

    return () => {
      observers.forEach((ro) => ro.disconnect());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main>
        {/* 1.0 — Hero: Full-viewport centerpiece with beam glow + product preview */}
        <section id="hero">
          <Hero />
        </section>

        {/* 2.0 — Academy & Roadmap Section */}
        <section id="academy">
          <AcademyHome />
        </section>

        {/* 2.5 — Interactive Roadmap Mimic */}
        <section id="roadmap">
          <RoadmapHomeSection />
        </section>

        {/* 2.55 — Resources & Developer Roadmaps */}
        <section id="resources">
          <ResourcesHome />
        </section>

        {/* 2.58 — Hands-on Projects */}
        <section id="projects">
          <ProjectsHomeSection />
        </section>

        {/* 2.6 — Companies Section */}
        <section id="companies">
          <CompaniesHomeSection />
        </section>

        {/* 2.7 — System Design Section */}
        <section id="systemdesign">
          <SystemdesignHome />
        </section>

        {/* 4.0 — Arena Section */}
        <section id="arena">
          <ArenaHome />
        </section>

        {/* 4.1 — Contests Section */}
        <section id="contests">
          <ContestsHome />
        </section>

        {/* 4.5 — Deep Dive: Alternating feature rows with live visuals */}
        {/* <DeepDive /> */}

        {/* 5.0 — Compiler Showcase: Wide visual of the playground */}
        <section id="compilers">
          <CompilerSection />
        </section>

        {/* 6.0 — CTA: Final call-to-action with glow centerpiece */}
        <section id="cta">
          <CTASection />
        </section>
      </main>
    </div>
  );
};
