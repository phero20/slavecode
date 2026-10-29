"use client";

import React from "react";
import {
  Brain,
  BrainCircuit,
  Server,
  Network,
  Cloud,
  ShieldAlert,
  Smartphone,
  Layers,
  Database,
  Boxes,
  Code2,
  Globe,
  Gamepad2,
  Briefcase,
  CheckCircle2,
  GitFork,
  Terminal,
} from "lucide-react";

export const ROADMAP_GRADIENTS = [
  { c1: "#06b6d4", c2: "#0284c7", glow: "rgba(6, 182, 212, 0.3)" }, // Cyan / Sky (React / Frontend)
  { c1: "#10b981", c2: "#059669", glow: "rgba(16, 185, 129, 0.3)" }, // Emerald (Backend)
  { c1: "#f97316", c2: "#ea580c", glow: "rgba(249, 115, 22, 0.3)" }, // Orange (System Design)
  { c1: "#a855f7", c2: "#7c3aed", glow: "rgba(168, 85, 247, 0.3)" }, // Violet / Purple (AI Engineer)
  { c1: "#3b82f6", c2: "#1d4ed8", glow: "rgba(59, 130, 246, 0.3)" }, // Royal Blue (DevOps)
  { c1: "#6366f1", c2: "#4f46e5", glow: "rgba(99, 102, 241, 0.3)" }, // Electric Indigo (Machine Learning)
  { c1: "#f43f5e", c2: "#e11d48", glow: "rgba(244, 63, 94, 0.3)" },  // Rose / Red (Cybersecurity)
  { c1: "#ec4899", c2: "#be185d", glow: "rgba(236, 72, 153, 0.3)" }, // Pink (Full Stack / Mobile)
];

interface RoadmapIconProps {
  slug: string;
  category?: string;
  name?: string;
  index: number;
  className?: string;
  size?: "header" | "card";
}

/**
 * 3-Tier Resolution Strategy for Roadmap Icons:
 * 1. Specific Tech Brand Slug (e.g., React, Python, Docker, AWS)
 * 2. High-Level Category (e.g., Web Development, DevOps, AI, Mobile, Databases)
 * 3. Default Universal Roadmap Icon (GitFork)
 */
function getIconForRoadmap(
  slug: string,
  category: string | undefined,
  color: string
) {
  const normSlug = slug.toLowerCase().trim();
  const normCat = (category || "").toLowerCase().trim();

  // ==========================================
  // TIER 1: EXACT TECH SLUG / BRAND MATCH
  // ==========================================

  // React
  if (normSlug.includes("react")) {
    return (
      <svg
        viewBox="-11.5 -10.23174 23 20.46348"
        className="w-7 h-7 sm:w-9 sm:h-9"
        fill="none"
        stroke={color}
      >
        <circle cx="0" cy="0" r="2.05" fill={color} />
        <g strokeWidth="1">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  // Python
  if (normSlug.includes("python")) {
    return (
      <svg viewBox="0 0 128 128" className="w-7 h-7 sm:w-8 sm:h-8" fill="none">
        <path
          fill="url(#py-blue)"
          d="M63.5 12.3c-23.7 0-22.2 10.3-22.2 10.3l.03 10.6h22.6v3.2H32.5s-14.7 1.7-14.7 21.6 12.8 21 12.8 21h7.7V68.3s-.4-12.8 12.6-12.8h21.8s12.2-.2 12.2-11.9v-19.6s1.8-11.7-21.4-11.7zm-12.3 6.6a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6z"
        />
        <path
          fill="url(#py-yellow)"
          d="M64.5 115.7c23.7 0 22.2-10.3 22.2-10.3l-.03-10.6H64.07v-3.2h31.4s14.7-1.7 14.7-21.6-12.8-21-12.8-21h-7.7v10.7s.4 12.8-12.6 12.8H55.27s-12.2.2-12.2 11.9v19.6s-1.8 11.7 21.4 11.7zm12.3-6.6a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6z"
        />
        <defs>
          <linearGradient
            id="py-blue"
            x1="17.8"
            y1="38.7"
            x2="84.2"
            y2="38.7"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#387eb8" />
            <stop offset="1" stopColor="#366994" />
          </linearGradient>
          <linearGradient
            id="py-yellow"
            x1="43"
            y1="89.3"
            x2="110.2"
            y2="89.3"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffe873" />
            <stop offset="1" stopColor="#ffd43b" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // TypeScript / JavaScript / HTML / CSS
  if (
    normSlug.includes("typescript") ||
    normSlug.includes("javascript") ||
    normSlug === "js" ||
    normSlug === "ts"
  ) {
    return <Code2 className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // Low-level languages: C / C++ / Rust / Go / Bash
  if (
    normSlug === "c" ||
    normSlug.includes("cpp") ||
    normSlug.includes("rust") ||
    normSlug.includes("golang") ||
    normSlug.includes("linux") ||
    normSlug.includes("bash") ||
    normSlug.includes("shell")
  ) {
    return <Terminal className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // Cloud / Containers: Docker / Kubernetes / Cloudflare
  if (
    normSlug.includes("docker") ||
    normSlug.includes("kubernetes") ||
    normSlug.includes("cloudflare")
  ) {
    return <Boxes className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // AWS / Cloud Provider
  if (normSlug.includes("aws") || normSlug.includes("cloud")) {
    return <Cloud className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // ==========================================
  // TIER 2: CATEGORY-BASED MATCHING
  // ==========================================

  // 1. AI, ML & Data Science
  if (
    normCat.includes("ai") ||
    normCat.includes("data-science") ||
    normCat.includes("machine-learning") ||
    normSlug.includes("ai-") ||
    normSlug.includes("machine-learning") ||
    normSlug.includes("prompt-engineering")
  ) {
    return <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 2. Web Development & Frontend
  if (
    normCat.includes("web") ||
    normCat.includes("frontend") ||
    normSlug.includes("frontend") ||
    normSlug.includes("html") ||
    normSlug.includes("css") ||
    normSlug.includes("vue") ||
    normSlug.includes("angular")
  ) {
    return <Globe className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 3. Backend & APIs
  if (
    normCat.includes("backend") ||
    normSlug.includes("backend") ||
    normSlug.includes("node") ||
    normSlug.includes("api") ||
    normSlug.includes("spring-boot") ||
    normSlug.includes("django") ||
    normSlug.includes("laravel") ||
    normSlug.includes("php") ||
    normSlug.includes("aspnet")
  ) {
    return <Server className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 4. DevOps & Cloud
  if (
    normCat.includes("devops") ||
    normCat.includes("cloud") ||
    normSlug.includes("devops") ||
    normSlug.includes("terraform")
  ) {
    return <Cloud className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 5. Databases & Data Engineering
  if (
    normCat.includes("database") ||
    normCat.includes("data") ||
    normSlug.includes("sql") ||
    normSlug.includes("postgresql") ||
    normSlug.includes("mongodb") ||
    normSlug.includes("redis") ||
    normSlug.includes("elasticsearch")
  ) {
    return <Database className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 6. Cybersecurity
  if (
    normCat.includes("security") ||
    normSlug.includes("security") ||
    normSlug.includes("cyber") ||
    normSlug.includes("devsecops")
  ) {
    return <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 7. System Design & Software Architecture
  if (
    normCat.includes("architecture") ||
    normCat.includes("computer-science") ||
    normSlug.includes("system-design") ||
    normSlug.includes("architecture") ||
    normSlug.includes("datastructures")
  ) {
    return <Network className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 8. Mobile Development
  if (
    normCat.includes("mobile") ||
    normSlug.includes("mobile") ||
    normSlug.includes("android") ||
    normSlug.includes("ios") ||
    normSlug.includes("flutter") ||
    normSlug.includes("react-native") ||
    normSlug.includes("kotlin") ||
    normSlug.includes("swift")
  ) {
    return <Smartphone className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 9. Full Stack
  if (normCat.includes("full-stack") || normSlug.includes("full-stack")) {
    return <Layers className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 10. Game Development
  if (normCat.includes("game") || normSlug.includes("game")) {
    return <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 11. QA & Testing
  if (
    normCat.includes("qa") ||
    normCat.includes("testing") ||
    normSlug.includes("qa") ||
    normSlug.includes("code-review")
  ) {
    return <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // 12. Management & Leadership
  if (
    normCat.includes("management") ||
    normSlug.includes("manager") ||
    normSlug.includes("product")
  ) {
    return <Briefcase className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
  }

  // ==========================================
  // TIER 3: UNIVERSAL DEFAULT ROADMAP ICON
  // ==========================================
  return <GitFork className="w-7 h-7 sm:w-8 sm:h-8" style={{ color }} />;
}

export function RoadmapIcon({
  slug,
  category,
  name,
  index,
  className,
  size = "header",
}: RoadmapIconProps) {
  const colors = ROADMAP_GRADIENTS[index % ROADMAP_GRADIENTS.length];
  const gradientId = `roadmap-hex-${slug}-${index}`;
  const shadowId = `${gradientId}-shadow`;

  const sizeClasses =
    size === "card"
      ? "h-14 w-14"
      : "h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]";

  return (
    <div
      className={`relative ${sizeClasses} object-contain drop-shadow-sm flex items-center justify-center transition-transform duration-300 ${
        className || ""
      }`}
    >
      {/* Background SVG Hexagon with White Fill and Gradient Stroke */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.c1} />
            <stop offset="1" stopColor={colors.c2} />
          </linearGradient>
          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.15" />
          </filter>
        </defs>
        <path
          d="M50 4.8 C51.7 4.8 53.1 5.5 54.2 6.6 L85.5 26 C87.7 27.4 89.1 30 89.1 32.8 L89.1 67.2 C89.1 70 87.7 72.6 85.5 74 L54.2 93.4 C53.1 94.5 51.7 95.2 50 95.2 C48.3 95.2 46.9 94.5 45.8 93.4 L14.5 74 C12.3 72.6 10.9 70 10.9 67.2 L10.9 32.8 C10.9 30 12.3 27.4 14.5 26 L45.8 6.6 C46.9 5.5 48.3 4.8 50 4.8 Z"
          fill="#ffffff"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinejoin="round"
          filter={`url(#${shadowId})`}
        />
      </svg>

      {/* Center Icon */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-[20%]">
        {getIconForRoadmap(slug, category, colors.c1)}
      </div>
    </div>
  );
}
