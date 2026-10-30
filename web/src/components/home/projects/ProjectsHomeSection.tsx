"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/projects/project-card";
import type { RoadmapProjectItem } from "@/types/project";

const SAMPLE_PROJECTS: RoadmapProjectItem[] = [
  {
    id: "expense-tracker-api",
    slug: "expense-tracker-api",
    title: "Expense Tracker API",
    description: "Build an API for an expense tracker application.",
    difficulty: "beginner",
    roadmapIds: ["backend"],
    topics: ["REST API", "Database", "Authentication"],
    skills: ["Node.js", "Express", "JWT"],
    order: 1,
    origin: "official",
    status: "approved",
    content: {
      overview: "Build an API for an expense tracker application.",
      requirements: [
        "JWT Authentication",
        "CRUD Operations for Expenses",
        "Category and Date Filtering"
      ],
      checklist: [],
      suggestedTechStack: ["Node.js", "Express", "PostgreSQL"],
      previewImage: "https://assets.roadmap.sh/guest/expense-tracker-api-m72p5.png",
    },
    stats: {
      startedCount: 0,
      completedCount: 0,
      upvotesCount: 860,
    },
  },
  {
    id: "e-commerce-api",
    slug: "e-commerce-api",
    title: "E-Commerce API",
    description: "E-Commerce platform with cart and payment gateway integration.",
    difficulty: "intermediate",
    roadmapIds: ["backend", "full-stack"],
    topics: ["E-Commerce", "Payments", "Database"],
    skills: ["Node.js", "Stripe", "PostgreSQL"],
    order: 4,
    origin: "official",
    status: "approved",
    content: {
      overview: "E-Commerce platform with cart and payment gateway integration.",
      requirements: [
        "Product catalog with inventory tracking",
        "Cart persistence and checkout session",
        "Stripe payment gateway webhook handling"
      ],
      checklist: [],
      suggestedTechStack: ["Node.js", "PostgreSQL", "Stripe"],
      previewImage: "https://assets.roadmap.sh/guest/simple-ecommerce-api-thzqo.png",
    },
    stats: {
      startedCount: 0,
      completedCount: 0,
      upvotesCount: 200,
    },
  },
  {
    id: "weather-api",
    slug: "weather-api",
    title: "Weather API",
    description: "Build a weather API that fetches and returns weather data.",
    difficulty: "beginner",
    roadmapIds: ["backend"],
    topics: ["REST API", "Caching", "External API"],
    skills: ["TypeScript", "Redis", "Node.js"],
    order: 2,
    origin: "official",
    status: "approved",
    content: {
      overview: "Build a weather API that fetches and returns weather data.",
      requirements: [
        "Fetch real-time weather data",
        "Cache responses using Redis",
        "Implement rate limiting"
      ],
      checklist: [],
      suggestedTechStack: ["TypeScript", "Node.js", "Redis"],
      previewImage: "https://assets.roadmap.sh/guest/weather-api-f8i1q.png"
,
    },
    stats: {
      startedCount: 0,
      completedCount: 0,
      upvotesCount: 900,
    },
  },
  {
    id: "todo-list-api",
    slug: "todo-list-api",
    title: "Todo List API",
    description: "Build a RESTful API to allow users to manage their to-do list.",
    difficulty: "beginner",
    roadmapIds: ["backend"],
    topics: ["REST API", "CRUD", "Authentication"],
    skills: ["Python", "FastAPI", "SQLite"],
    order: 3,
    origin: "official",
    status: "approved",
    content: {
      overview: "Build a RESTful API to allow users to manage their to-do list.",
      requirements: [
        "User registration and login",
        "Manage tasks with completion status",
        "Pagination and search query support"
      ],
      checklist: [],
      suggestedTechStack: ["Python", "FastAPI", "SQLite"],
      previewImage: "https://assets.roadmap.sh/guest/todo-list-api-bsrdd.png",
    },
    stats: {
      startedCount: 0,
      completedCount: 0,
      upvotesCount: 600,
    },
  },
  
];

export const ProjectsHomeSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background py-20 sm:py-28 border-b">
      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">

        {/* Centered Projects Header (matching DSA Roadmap & Resources pattern) */}
        <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Projects
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Bridge the gap between theory and production. <br className="hidden sm:block" />
            Build production-grade applications, system clones, and developer tools with step-by-step guidance.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

          {/* Left Column: Heading, Value Proposition & CTA (clean typography matching RoadmapHomeSection) */}
          <div className="flex flex-col items-start text-left max-w-2xl lg:pr-10 relative z-30 order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
              Build Real Software <br className="hidden md:block" />
              <span className="text-primary">and Grow Your Portfolio</span>
            </h2>

            <div className="flex flex-col gap-6 text-lg text-muted-foreground leading-relaxed mb-6">
              <p>
                Syntax is easy, but engineering resilient systems takes practice. Explore guided projects with clear architectural blueprints, requirement checklists, and step-by-step milestones.
              </p>
              <p>
                From foundational tools to complex distributed architectures like Redis and Git, every project challenges you to design data structures, handle concurrency, and ship production-ready code.
              </p>
            </div>

            <div className="flex flex-col items-start relative z-30">
              <Button
                id="home-projects-cta-btn"
                variant="link"
                className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
                asChild
              >
                <Link href="/projects">
                  Explore all projects <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: 2x2 Grid of 4 Project Cards (non-clickable preview) */}
          <div className="relative w-full pointer-events-none select-none order-1 lg:order-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_PROJECTS.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => {}}
                  className={cn(
                    "cursor-default pointer-events-none hover:border-border",
                    index >= 2 && "hidden sm:flex"
                  )}
                />
              ))}
            </div>

            {/* Bottom Fade Overlay placed outside cards and extending below them so card bottom borders dissolve seamlessly */}
            <div className="absolute -inset-x-4 -bottom-12 sm:-bottom-20 h-80 sm:h-[460px] lg:h-[700px] bg-linear-to-t from-background via-background/85 to-transparent z-20 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* Section-level Bottom Fade Overlay outside cards, blending the entire bottom into background */}
      <div className="hidden lg:block absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-background via-background/80 to-transparent z-20 pointer-events-none" />
    </section>
  );
};

export default ProjectsHomeSection;
