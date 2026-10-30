"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Search, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResourcesHeader } from "@/components/resources/overview/resources-header";
import type { RoadmapSummary } from "@/types/resource";

const SAMPLE_ROADMAPS: RoadmapSummary[] = [
  {
    id: "frontend",
    slug: "frontend",
    title: { card: "Frontend", page: "Frontend Developer" },
    description: "Step-by-step guide to becoming a modern frontend developer.",
    category: "role",
    nodesCount: 42,
  },
  {
    id: "backend",
    slug: "backend",
    title: { card: "Backend", page: "Backend Developer" },
    description: "Step-by-step guide to becoming a modern backend developer.",
    category: "role",
    nodesCount: 50,
  },
  {
    id: "devops",
    slug: "devops",
    title: { card: "DevOps", page: "DevOps Engineer" },
    description: "Comprehensive pathway for DevOps, CI/CD, and operations.",
    category: "role",
    nodesCount: 38,
  },
  {
    id: "full-stack",
    slug: "full-stack",
    title: { card: "Full Stack", page: "Full Stack Developer" },
    description: "End-to-end web architecture and full-stack development path.",
    category: "role",
    nodesCount: 65,
  },
  {
    id: "ai-engineer",
    slug: "ai-engineer",
    title: { card: "AI Engineer", page: "AI Engineer" },
    description: "Essential roadmap for building AI and agentic systems.",
    category: "role",
    nodesCount: 35,
  },
  {
    id: "system-design",
    slug: "system-design",
    title: { card: "System Design", page: "System Design" },
    description: "Distributed architectures, microservices, and scale.",
    category: "skill",
    nodesCount: 40,
  },
  {
    id: "docker",
    slug: "docker",
    title: { card: "Docker", page: "Docker" },
    description: "Containerization fundamentals and production workflows.",
    category: "skill",
    nodesCount: 28,
  },
  {
    id: "react",
    slug: "react",
    title: { card: "React", page: "React Developer" },
    description: "Modern React architecture, hooks, state, and ecosystem.",
    category: "skill",
    nodesCount: 32,
  },
];

// Exact category names and counts from real Resources page
const SIDEBAR_CATEGORIES = [
  { name: "All Roadmaps", count: 96, active: true },
  { name: "Absolute Beginners", count: 34 },
  { name: "Web Development", count: 70 },
  { name: "Frameworks", count: 9 },
  { name: "Languages / Platforms", count: 23 },
  { name: "AI & Machine Learning", count: 26 },
  { name: "DevOps", count: 50 },
  { name: "Mobile Development", count: 9 },
  { name: "Databases", count: 26 },
  { name: "Computer Science", count: 31 },
  { name: "Management", count: 10 },
  { name: "Game Development", count: 7 },
  { name: "Design", count: 4 },
  { name: "Blockchain", count: 4 },
];

// Exact sections and roadmap pills from real Resources page
const NEW_ROADMAPS = [
  { slug: "seo", title: "SEO" },
  { slug: "inference-engineering", title: "Inference Engineering" },
];

const ROLE_BASED_ROADMAPS = [
  { slug: "frontend", title: "Frontend" },
  { slug: "backend", title: "Backend" },
  { slug: "full-stack", title: "Full Stack" },
  { slug: "android", title: "Android" },
  { slug: "devops", title: "DevOps" },
  { slug: "devsecops", title: "DevSecOps" },
  { slug: "data-analyst", title: "Data Analyst" },
  { slug: "seo", title: "SEO" },
  { slug: "inference-engineering", title: "Inference Engineering" },
  { slug: "data-engineer", title: "Data Engineer" },
  { slug: "machine-learning", title: "Machine Learning" },
  { slug: "postgresql", title: "PostgreSQL" },
  { slug: "ios", title: "iOS" },
  { slug: "blockchain", title: "Blockchain" },
];

export const ResourcesHomeSection = () => {
  return (
    <section className="py-8 w-full">
      <div>
        {/* ROW 1: Two Column Layout (Mirroring SystemDesignHomeSection) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-10 items-center">
          
          {/* LEFT SIDE: ResourcesHeader with Hexagon Arc + Heading + Subtitle */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            <div className="mb-8 w-full origin-left flex flex-col items-center text-center space-y-10">
              <ResourcesHeader
                totalRoadmaps={96}
                sampleRoadmaps={SAMPLE_ROADMAPS}
                as="h2"
              />
            </div>
          </div>

          {/* RIGHT SIDE: Real Resources Page Demo UI (Fully tokenized via theme variables) */}
          <div className="relative w-full flex flex-col justify-center">
            
            {/* The Mock Browser/App Window */}
            <Card className="relative w-full overflow-hidden flex h-[440px] sm:h-[500px] pointer-events-none opacity-90 shadow-none border-border/50 bg-background">
              
              {/* Left Sidebar: Exact Categories from CategoryDesktopSidebar */}
              <div className="w-[170px] sm:w-[210px] shrink-0 border-r border-border/40 flex-col bg-card/30 hidden md:flex relative">
              

                <div className="p-3.5 pb-2 border-b">
                  <span className="text-xs font-bold text-foreground/80 tracking-tight ">
                    Categories
                  </span>
                  
                  {/* Search categories input */}
                  <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-card/50 text-[11px] text-muted-foreground">
                    <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="truncate">Search categories...</span>
                  </div>
                </div>

                {/* Category List */}
                <div className="flex-1 overflow-hidden flex flex-col gap-0.5 px-2 py-1">
                  {SIDEBAR_CATEGORIES.slice(0, 10).map((cat) => (
                    <div
                      key={cat.name}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                        cat.active
                          ? "bg-secondary text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="truncate pr-1">{cat.name}</span>
                      <span
                        className={`text-[10px] tabular-nums shrink-0 ${
                          cat.active ? "text-primary font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Area: Replicating ResourcesClient */}
              <div className="flex-1 p-5 sm:p-6 flex flex-col gap-5 overflow-hidden bg-background">
                
                {/* Top Mobile Bar */}
                <div className="md:hidden flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/40">
                  <span className="font-bold text-foreground">All Roadmaps</span>
                  <Menu className="w-4 h-4" />
                </div>

                {/* Top Desktop Bar: "All Roadmaps" + Search */}
                <div className="hidden md:flex items-center justify-between pb-2 border-b border-border/40">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                    All Roadmaps
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-card/50 text-[11px] text-muted-foreground w-44 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>Search roadmaps...</span>
                  </div>
                </div>

                {/* Section 1: NEW ROADMAPS */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    NEW ROADMAPS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {NEW_ROADMAPS.map((r) => (
                      <div
                        key={r.slug}
                        className="group flex items-center justify-between rounded-lg sm:rounded-xl border border-border/50 bg-card/80 px-3.5 py-2.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted/70"
                      >
                        <span className="truncate group-hover:text-primary transition-colors">{r.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 ml-2 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: ROLE BASED ROADMAPS */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    ROLE BASED ROADMAPS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ROLE_BASED_ROADMAPS.slice(0, 10).map((r, i) => (
                      <div
                        key={`${r.slug}-${i}`}
                        className="group flex items-center justify-between rounded-lg sm:rounded-xl border border-border/50 bg-card/80 px-3.5 py-2.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted/70"
                      >
                        <span className="truncate group-hover:text-primary transition-colors">{r.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 ml-2 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </Card>

            {/* Section Level Fade Overlay (matching SystemDesignHomeSection) */}
            <div className="absolute inset-x-0 bottom-0 h-52 bg-linear-to-t from-background via-background/70 to-transparent z-10 pointer-events-none" />

            {/* Centered CTA Button */}
            <div className="flex flex-col items-center justify-center relative z-30">
              <Button
                variant="link"
                className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
                asChild
              >
                <Link href="/resources">
                  See all Roadmaps <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
