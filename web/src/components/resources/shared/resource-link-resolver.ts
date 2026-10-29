"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type ResolvedResourceAction =
  | { type: "external"; url: string }
  | { type: "tab"; tab: string; slug?: string }
  | { type: "roadmap"; href: string; slug: string }
  | { type: "none" };

/**
 * Universal resource link resolver that normalizes any link from roadmap data:
 * - Variant queries (?r=frontend-beginner) -> routes to variant roadmap
 * - Project links (/frontend/projects?difficulty=...) -> switches to Projects tab
 * - Inter-roadmap links (/backend, /resources/sql) -> routes to target roadmap
 * - External documentation -> opens in new tab
 */
export function resolveResourceLink(
  rawHref: string | undefined | null,
  currentSlug?: string,
): ResolvedResourceAction {
  if (!rawHref) return { type: "none" };

  const trimmed = rawHref.trim();
  if (!trimmed || trimmed === "#" || trimmed.startsWith("#")) {
    return { type: "none" };
  }

  // 1. External Links (MDN, official docs, GitHub, etc.)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If it's a legacy roadmap.sh link that wasn't replaced, extract pathname
    if (trimmed.includes("roadmap.sh/")) {
      const parts = trimmed.split("roadmap.sh/")[1];
      if (parts) {
        return resolveResourceLink(`/${parts}`, currentSlug);
      }
    }
    return { type: "external", url: trimmed };
  }

  // 2. Query Variants (e.g. /resources/frontend?r=frontend-beginner or ?r=frontend-beginner)
  if (trimmed.includes("?r=") || trimmed.includes("&r=")) {
    try {
      const queryString = trimmed.includes("?")
        ? trimmed.split("?")[1]
        : trimmed;
      const params = new URLSearchParams(queryString);
      const variantSlug = params.get("r");
      if (variantSlug) {
        return {
          type: "roadmap",
          href: `/resources/${variantSlug}`,
          slug: variantSlug,
        };
      }
    } catch {
      // Fallback to standard path handling
    }
  }

  // 3. Project Links (e.g. /resources/frontend/projects?difficulty=beginner or /frontend/projects)
  if (trimmed.includes("/projects")) {
    let targetSlug = currentSlug;
    const cleanPath = trimmed.split("?")[0].replace(/^\/resources\/?/, "").replace(/^\//, "");
    const parts = cleanPath.split("/projects");
    if (parts[0]) {
      targetSlug = parts[0];
    }
    return {
      type: "tab",
      tab: "project",
      slug: targetSlug,
    };
  }

  // 4. AI Tutor Links
  if (trimmed.includes("/ai-tutor")) {
    return {
      type: "tab",
      tab: "ai-tutor",
      slug: currentSlug,
    };
  }

  // 5. Direct Roadmap Links (e.g. /resources/ai-engineer or /ai-engineer)
  let cleanSlug = trimmed.split("?")[0].split("#")[0];
  if (cleanSlug.startsWith("/resources/")) {
    cleanSlug = cleanSlug.replace("/resources/", "");
  } else if (cleanSlug.startsWith("/")) {
    cleanSlug = cleanSlug.replace("/", "");
  }

  // Remove trailing slashes
  cleanSlug = cleanSlug.replace(/\/$/, "");

  if (cleanSlug) {
    return {
      type: "roadmap",
      href: `/resources/${cleanSlug}`,
      slug: cleanSlug,
    };
  }

  return { type: "none" };
}

/**
 * React hook to perform smart navigation anywhere inside the resources module.
 */
export function useResourceNavigator() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (rawHref: string | undefined | null, currentSlug?: string) => {
      const action = resolveResourceLink(rawHref, currentSlug);

      switch (action.type) {
        case "external":
          window.open(action.url, "_blank", "noopener,noreferrer");
          break;

        case "tab": {
          const isSameSlug = !action.slug || action.slug === currentSlug;
          if (isSameSlug) {
            const currentParams = searchParams ? searchParams.toString() : "";
            const newParams = new URLSearchParams(currentParams);
            newParams.set("tab", action.tab);
            router.push(`?${newParams.toString()}`, { scroll: false });
          } else {
            router.push(`/resources/${action.slug}?tab=${action.tab}`);
          }
          break;
        }

        case "roadmap":
          router.push(action.href);
          break;

        case "none":
        default:
          break;
      }
    },
    [router, searchParams],
  );

  return { navigate, resolve: resolveResourceLink };
}
