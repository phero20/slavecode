"use client";

import { useEffect, useMemo, useState } from "react";

function isYouTubeHost(hostname: string): boolean {
  return (
    hostname.includes("youtube.com") ||
    hostname.includes("youtu.be") ||
    hostname.includes("youtube-nocookie.com")
  );
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (!isYouTubeHost(hostname)) return null;

    const v = parsed.searchParams.get("v");
    if (v) return v;

    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (["embed", "live", "v", "shorts", "watch"].includes(pathParts[0])) {
      return pathParts[1] || null;
    }
    if (hostname.includes("youtu.be")) {
      return pathParts[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function getResourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function unique(urls: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    const clean = url?.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }
  return result;
}

async function fetchJson(url: string, signal: AbortSignal): Promise<any | null> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function resolveRemoteThumbnails(
  pageUrl: string,
  signal: AbortSignal
): Promise<string[]> {
  const encoded = encodeURIComponent(pageUrl);
  const [noembed, microlink] = await Promise.all([
    fetchJson(`https://noembed.com/embed?url=${encoded}`, signal),
    fetchJson(`https://api.microlink.io/?url=${encoded}`, signal),
  ]);

  const found: string[] = [];
  if (typeof noembed?.thumbnail_url === "string") {
    found.push(noembed.thumbnail_url);
  }
  const ogImage = microlink?.data?.image?.url;
  if (typeof ogImage === "string") {
    found.push(ogImage);
  }
  found.push(`https://s.wordpress.com/mshots/v1/${encoded}?w=800`);
  return unique(found);
}

export function useResourcePreview(pageUrl: string, thumbnailUrl?: string | null) {
  const domain = useMemo(() => getResourceDomain(pageUrl), [pageUrl]);
  const faviconUrl = useMemo(
    () =>
      domain
        ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
        : null,
    [domain]
  );

  const immediateCandidates = useMemo(() => {
    const videoId = getYouTubeVideoId(pageUrl);
    return unique([
      thumbnailUrl,
      videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
      videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null,
    ]);
  }, [pageUrl, thumbnailUrl]);

  const [candidates, setCandidates] = useState<string[]>(immediateCandidates);
  const [index, setIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(true);
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    setCandidates(immediateCandidates);
    setIndex(0);
    setIsImageLoading(immediateCandidates.length > 0);
    setIsResolving(true);
    setFaviconError(false);

    const controller = new AbortController();
    resolveRemoteThumbnails(pageUrl, controller.signal)
      .then((remote) => {
        if (controller.signal.aborted) return;
        setCandidates((prev) => unique([...prev, ...remote]));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsResolving(false);
      });

    return () => controller.abort();
  }, [pageUrl, immediateCandidates]);

  const previewSrc = candidates[index] ?? null;

  useEffect(() => {
    setIsImageLoading(Boolean(previewSrc));
  }, [previewSrc]);

  const onImageLoad = () => setIsImageLoading(false);
  const onImageError = () => {
    setIndex((prev) => prev + 1);
  };

  return {
    domain,
    faviconUrl,
    faviconError,
    setFaviconError,
    previewSrc,
    isImageLoading: isImageLoading || (isResolving && !previewSrc),
    onImageLoad,
    onImageError,
  };
}
