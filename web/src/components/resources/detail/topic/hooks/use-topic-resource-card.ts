import { useState, useMemo } from "react";
import { tones } from "@/lib/tones";
import type { TopicResourceItem } from "@/types/resource";

export type ToneItem = (typeof tones)[number];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 33 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("?")[0];
    }
  } catch {
    // fallback
  }
  return null;
}

function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export interface UseTopicResourceCardResult {
  ytId: string | null;
  domain: string;
  isInternal: boolean;
  tone: ToneItem;
  imgError: boolean;
  faviconUrl: string;
  youtubeThumbnailUrl: string | null;
  onImgError: () => void;
}

export function useTopicResourceCard(
  item: TopicResourceItem,
  index?: number
): UseTopicResourceCardResult {
  const [imgError, setImgError] = useState(false);

  const ytId = useMemo(() => getYouTubeVideoId(item.url), [item.url]);
  const domain = useMemo(() => getDomain(item.url), [item.url]);
  const isInternal = useMemo(() => item.url.startsWith("/"), [item.url]);

  const tone = useMemo(() => {
    const seed =
      typeof index === "number"
        ? `${index}:${item.title}`
        : item.title || item.url;
    return tones[hashSeed(seed) % tones.length];
  }, [item.title, item.url, index]);

  const faviconUrl = useMemo(
    () => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    [domain]
  );

  const youtubeThumbnailUrl = useMemo(
    () => (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null),
    [ytId]
  );

  return {
    ytId,
    domain,
    isInternal,
    tone,
    imgError,
    faviconUrl,
    youtubeThumbnailUrl,
    onImgError: () => setImgError(true),
  };
}
