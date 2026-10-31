"use client";

import React from "react";
import { useHomeEmbed } from "./hooks";
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
  const { isEmbedded, embeddedSection } = useHomeEmbed();

  // If a specific section is requested in embed mode, isolate and render ONLY that section
  if (isEmbedded && embeddedSection) {
    return embeddedSection;
  }

  // Regular visitors see the full standard homepage
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
