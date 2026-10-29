"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { getBezierPath, getSmoothStepPath, Position } from "reactflow";
import type { RoadmapDetail, RoadmapNode, RoadmapEdge } from "@/types/resource";
import { tones } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useResourceNavigator } from "../../shared/resource-link-resolver";

export interface SelectedTopic {
  id: string;
  label: string;
  type?: string;
  legend?: {
    label?: string;
    color?: string;
  };
}

interface RoadmapCanvasProps {
  roadmap: RoadmapDetail;
  onSelectTopic?: (topic: SelectedTopic) => void;
}

// Deterministic tone selector
function hashLabel(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Universal word wrapping helper for SVG text elements
function wrapTextToLines(
  text: string,
  maxWidthPx: number,
  approxCharWidthPx = 7.5,
): string[] {
  if (!text) return [];
  const maxChars = Math.max(6, Math.floor(maxWidthPx / approxCharWidthPx));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const w of words) {
    if (!current) {
      current = w;
    } else if ((current + " " + w).length <= maxChars) {
      current = current + " " + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Unified node dimensions helper with accurate fallbacks per node type
function getNodeDimensions(n: any): { w: number; h: number } {
  const isTopic = n.type === "topic";
  const isSubtopic = n.type === "subtopic";
  const isButton = n.type === "button";
  const isSection = n.type === "section";
  const isTitle = n.type === "title" || n.type === "label";

  let defaultW = 180;
  let defaultH = 44;

  if (isTopic) {
    defaultW = 220;
    defaultH = 46;
  } else if (isSubtopic) {
    defaultW = 160;
    defaultH = 38;
  } else if (isButton) {
    defaultW = 180;
    defaultH = 40;
  } else if (isSection) {
    defaultW = 240;
    defaultH = 120;
  } else if (isTitle) {
    defaultW = 200;
    defaultH = 40;
  }

  const w =
    n.width ||
    n.measured?.width ||
    (typeof n.style?.width === "number" ? n.style.width : 0) ||
    (typeof n.data?.style?.width === "number" ? n.data.style.width : 0) ||
    defaultW;
  const h =
    n.height ||
    n.measured?.height ||
    (typeof n.style?.height === "number" ? n.style.height : 0) ||
    (typeof n.data?.style?.height === "number" ? n.data.style.height : 0) ||
    defaultH;

  return { w, h };
}

// Calculate legend marker position (matches roadmap.sh)
function getNodeLegendPosition(
  x: number,
  y: number,
  w: number,
  h: number,
  pos?: string,
): { x: number; y: number } {
  if (!pos || !w || !h) return { x: x + w - 10, y: y - 5 };
  switch (pos) {
    case "right-top":
      return { x: x + w - 10, y: y - 5 };
    case "right-bottom":
      return { x: x + w - 11.5, y: y + h - 11.5 };
    case "right-center":
      return { x: x + w - 11.5, y: y + h / 2 - 10 };
    case "left-top":
      return { x: x - 11.5, y: y - 5 };
    case "left-bottom":
      return { x: x - 11.5, y: y + h - 11.5 };
    case "left-center":
      return { x: x - 10, y: y + h / 2 - 10 };
    case "top-center":
      return { x: x + w / 2 - 10, y: y - 10 };
    case "bottom-center":
      return { x: x + w / 2 - 10, y: y + h - 10 };
    default:
      return { x: x + w - 10, y: y - 5 };
  }
}

// Handle position mappings matching roadmap.sh handle schema:
// w = Top, x = Bottom, y = Left, z = Right
function getHandlePosition(
  handleId: string | undefined,
  defaultPos: Position,
): Position {
  if (!handleId) return defaultPos;
  const char = handleId.charAt(0).toLowerCase();
  switch (char) {
    case "w":
      return Position.Top;
    case "x":
      return Position.Bottom;
    case "y":
      return Position.Left;
    case "z":
      return Position.Right;
    default:
      return defaultPos;
  }
}

function getNodeAnchor(n: any, pos: Position): { x: number; y: number } {
  const { w, h } = getNodeDimensions(n);
  switch (pos) {
    case Position.Top:
      return { x: n.position.x + w / 2, y: n.position.y };
    case Position.Bottom:
      return { x: n.position.x + w / 2, y: n.position.y + h };
    case Position.Left:
      return { x: n.position.x, y: n.position.y + h / 2 };
    case Position.Right:
      return { x: n.position.x + w, y: n.position.y + h / 2 };
  }
}

export function RoadmapCanvas({ roadmap, onSelectTopic }: RoadmapCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [learnedMap, setLearnedMap] = useState<Record<string, boolean>>({});

  const title = roadmap.title?.page || roadmap.title?.card || roadmap.slug;

  // Load learned topics from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && roadmap?.slug) {
      const keys = Object.keys(localStorage);
      const prefix = `roadmap-learned-${roadmap.slug}-`;
      const map: Record<string, boolean> = {};
      keys.forEach((k) => {
        if (k.startsWith(prefix)) {
          const id = k.replace(prefix, "");
          map[id] = localStorage.getItem(k) === "true";
        }
      });
      setLearnedMap(map);
    }
  }, [roadmap?.slug]);

  // Compute exact vector bounding box and viewBox matching roadmap.sh findDimensions
  const { viewBox, nodes, edges, nodeMap } = useMemo(() => {
    const rawNodes: any[] = roadmap.nodes || [];
    const rawEdges: any[] = roadmap.edges || [];

    if (rawNodes.length === 0) {
      return {
        viewBox: { x: 0, y: 0, width: 1000, height: 600 },
        nodes: [],
        edges: [],
        nodeMap: new Map(),
      };
    }

    // Defensive normalization: align buttons that belong to container cards
    const normalizedNodes = rawNodes.map((node) => {
      if (node.type !== "button") return node;

      // Find any container paragraph horizontally containing this button
      const container = rawNodes.find((c) => {
        if (c.type !== "paragraph") return false;
        const cx = c.position?.x ?? 0;
        const cy = c.position?.y ?? 0;
        const cw = c.width ?? 0;
        const nx = node.position?.x ?? 0;
        const ny = node.position?.y ?? 0;
        return (
          nx >= cx - 20 &&
          nx <= cx + cw + 20 &&
          Math.abs(ny - cy) < 150
        );
      });

      if (container) {
        const cx = container.position?.x ?? 0;
        const cy = container.position?.y ?? 0;
        const cw = container.width ?? 0;
        const ch = container.height ?? 0;

        // Look for sibling buttons strictly inside this container
        const siblings = rawNodes.filter((other) => {
          if (other.id === node.id || other.type !== "button") return false;
          const ox = other.position?.x ?? 0;
          const oy = other.position?.y ?? 0;
          return (
            ox >= cx - 20 &&
            ox <= cx + cw + 20 &&
            oy >= cy &&
            oy <= cy + ch
          );
        });

        if (siblings.length > 0) {
          const siblingY = siblings[0].position?.y;
          if (
            typeof siblingY === "number" &&
            Math.abs(node.position.y - siblingY) > 20 &&
            Math.abs(node.position.y - siblingY) < 150
          ) {
            return {
              ...node,
              position: {
                ...node.position,
                y: siblingY,
              },
            };
          }
        }
      }

      return node;
    });

    const nMap = new Map<string, any>();
    normalizedNodes.forEach((n) => nMap.set(String(n.id), n));

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    normalizedNodes.forEach((n) => {
      // Exclude hidden legend nodes from bounding box calculation
      if (n.type === "legend") return;

      const px = n.position?.x ?? 0;
      const py = n.position?.y ?? 0;
      const { w, h } = getNodeDimensions(n);

      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px + w > maxX) maxX = px + w;
      if (py + h > maxY) maxY = py + h;
    });

    // Balanced perimeter padding: generous horizontal room, comfortable vertical breathing room
    const paddingX = 64;
    const paddingTop = 72;
    const paddingBottom = 36;
    let measuredWidth = Math.round(maxX - minX) + paddingX * 2;
    let measuredHeight = Math.round(maxY - minY) + paddingTop + paddingBottom;
    let x = Math.floor(minX) - paddingX;
    let y = Math.round(minY) - paddingTop;

    if (measuredWidth < 1050) {
      const diff = 1050 - measuredWidth;
      measuredWidth = 1050;
      x -= diff / 2;
    }

    return {
      viewBox: { x, y, width: measuredWidth, height: measuredHeight },
      nodes: normalizedNodes,
      edges: rawEdges,
      nodeMap: nMap,
    };
  }, [roadmap.nodes, roadmap.edges]);

  // Handle clicking topic or subtopic
  const handleNodeClick = useCallback(
    (node: any) => {
      if (node.type === "topic" || node.type === "subtopic") {
        onSelectTopic?.({
          id: String(node.id),
          label: node.data?.label || node.title || "Concept Topic",
          type: node.type,
          legend: node.data?.legend,
        });
      }
    },
    [onSelectTopic]
  );

  const { navigate: navigateResource } = useResourceNavigator();

  // Handle button navigation with smart resolver
  const handleButtonClick = useCallback(
    (node: any) => {
      const href = node.data?.href || node.data?.url;
      if (!href) return;
      navigateResource(href, roadmap.slug);
    },
    [navigateResource, roadmap.slug],
  );

  return (
    <div
      ref={containerRef}
      id="roadmap-canvas-container"
      className="w-full flex flex-col items-center select-none"
    >
      {/* Main Roadmap Vector Viewport */}
      <div
        id="roadmap-svg-viewport"
        className="w-full flex justify-center overflow-hidden"
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
          }}
          className="relative shrink-0 flex justify-center"
        >
          <svg
            id="roadmap-vector-svg"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            className="w-full h-auto overflow-visible select-none"
            style={{
              fontFamily:
                "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            }}
          >
            {/* LAYER 1: SECTIONS (Dashed grouping boundaries with generous internal padding) */}
            {nodes
              .filter((n) => n.type === "section")
              .map((section) => {
                const sx = section.position.x;
                const sy = section.position.y;
                const { w: sw, h: sh } = getNodeDimensions(section);
                const tone = tones[0];
                // Inset container inward to guarantee crisp ~10-12px gaps between adjacent boxes
                const insetX = 8;
                const insetY = 8;
                const rectX = sx + insetX;
                const rectY = sy + insetY;
                const rectW = Math.max(sw - insetX * 2, 20);
                const rectH = Math.max(sh - insetY * 2, 20);

                return (
                  <g
                    key={section.id}
                    id={`section-${section.id}`}
                    pointerEvents="none"
                  >
                    <rect
                      x={rectX}
                      y={rectY}
                      width={rectW}
                      height={rectH}
                      rx={8}
                      fill={tone.fill + "06"}
                      stroke={tone.fill + "40"}
                      strokeWidth={1.8}
                      strokeDasharray="4 4"
                    />
                    {section.data?.label && (
                      <text
                        x={rectX + 8}
                        y={rectY - 6}
                        fill={tone.fill}
                        fontSize={10.5}
                        fontWeight={700}
                        letterSpacing="1px"
                        textAnchor="start"
                        className="uppercase opacity-85 select-none"
                      >
                        {section.data.label}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* LAYER 2: VERTICAL & HORIZONTAL GUIDES */}
            {nodes
              .filter((n) => n.type === "vertical" || n.type === "horizontal")
              .map((guide) => {
                const isVert = guide.type === "vertical";
                const gw = guide.width || guide.measured?.width || 0;
                const gh = guide.height || guide.measured?.height || 0;
                const x1 = isVert
                  ? guide.position.x + gw / 2
                  : guide.position.x;
                const y1 = isVert
                  ? guide.position.y
                  : guide.position.y + gh / 2;
                const x2 = isVert
                  ? guide.position.x + gw / 2
                  : guide.position.x + gw;
                const y2 = isVert
                  ? guide.position.y + gh
                  : guide.position.y + gh / 2;

                return (
                  <line
                    key={guide.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={tones[2].fill}
                    strokeWidth={2.8}
                    strokeDasharray="0.8 8"
                    strokeLinecap="round"
                    pointerEvents="none"
                    opacity={0.8}
                  />
                );
              })}

            {/* LAYER 3: EDGES (Vector connections using getSmoothStepPath / getBezierPath) */}
            {edges.map((edge, idx) => {
              const srcNode = nodeMap.get(String(edge.source));
              const tgtNode = nodeMap.get(String(edge.target));
              if (!srcNode || !tgtNode) return null;

              const srcPos = getHandlePosition(
                edge.sourceHandle,
                Position.Bottom,
              );
              const tgtPos = getHandlePosition(edge.targetHandle, Position.Top);
              const srcAnchor = getNodeAnchor(srcNode, srcPos);
              const tgtAnchor = getNodeAnchor(tgtNode, tgtPos);

              const isDashed =
                edge.data?.edgeStyle === "dashed" ||
                (edge.style?.strokeDasharray &&
                  edge.style.strokeDasharray !== "0");

              // Smooth step curve matching roadmap.sh
              const [pathData] = isDashed
                ? getSmoothStepPath({
                    sourceX: srcAnchor.x,
                    sourceY: srcAnchor.y,
                    sourcePosition: srcPos,
                    targetX: tgtAnchor.x,
                    targetY: tgtAnchor.y,
                    targetPosition: tgtPos,
                    borderRadius: 5,
                  })
                : getBezierPath({
                    sourceX: srcAnchor.x,
                    sourceY: srcAnchor.y,
                    sourcePosition: srcPos,
                    targetX: tgtAnchor.x,
                    targetY: tgtAnchor.y,
                    targetPosition: tgtPos,
                    curvature: 0.25,
                  });

              const strokeColor = edge.style?.stroke || tones[2].fill;

              return (
                <path
                  key={edge.id || idx}
                  id={`edge-${edge.id || idx}`}
                  d={pathData}
                  stroke={strokeColor}
                  strokeWidth={2.8}
                  strokeDasharray={isDashed ? "0.8 8" : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  pointerEvents="none"
                  opacity={0.88}
                />
              );
            })}

            {/* LAYER 4: TITLES & LABELS (Properly scaled, elegant sans-serif, multi-line wrapping) */}
            {nodes
              .filter((n) => n.type === "title" || n.type === "label")
              .map((titleNode) => {
                const tx = titleNode.position.x;
                const ty = titleNode.position.y;
                const { w: tw, h: th } = getNodeDimensions(titleNode);
                const tone =
                  tones[
                    hashLabel(titleNode.data?.label || titleNode.id) %
                      tones.length
                  ];
                const rawLabel = titleNode.data?.label || "";
                const isLabel = titleNode.type === "label";

                // Tasteful responsive typography scale (prevents collisions between adjacent columns)
                const fontSize = isLabel
                  ? 12
                  : rawLabel.length > 22
                    ? 14
                    : rawLabel.length > 14
                      ? 15.5
                      : 17;
                const approxCharWidth = fontSize * 0.62;
                // Wrap title into multiple lines if wider than container
                const lines = wrapTextToLines(
                  rawLabel,
                  Math.max(tw, 160),
                  approxCharWidth,
                );
                const lineHeight = fontSize * 1.32;
                const totalTextHeight = lines.length * lineHeight;
                const startY =
                  ty + th / 2 - totalTextHeight / 2 + lineHeight / 2 + 1;

                return (
                  <g
                    key={titleNode.id}
                    id={`title-${titleNode.id}`}
                    pointerEvents="none"
                  >
                    <text
                      x={tx + tw / 2}
                      y={startY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={tone.fill}
                      fontSize={fontSize}
                      fontWeight={isLabel ? 600 : 800}
                      letterSpacing={isLabel ? "0.5px" : "1px"}
                      className="uppercase select-none font-sans"
                    >
                      {lines.map((line, lIdx) => (
                        <tspan
                          key={lIdx}
                          x={tx + tw / 2}
                          dy={lIdx === 0 ? 0 : lineHeight}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}

            {/* LAYER 5: PARAGRAPHS & CONTAINER BOXES */}
            {nodes
              .filter((n) => n.type === "paragraph")
              .map((paraNode) => {
                const px = paraNode.position.x;
                const py = paraNode.position.y;
                const { w: pw, h: ph } = getNodeDimensions(paraNode);
                const tone =
                  tones[
                    hashLabel(paraNode.data?.label || paraNode.id) %
                      tones.length
                  ];

                // Detect if this paragraph represents a container group / banner card
                const bColor = paraNode.data?.style?.borderColor;
                const bgColor = paraNode.data?.style?.backgroundColor;
                const hasRealBorder = Boolean(
                  bColor && bColor !== "transparent" && bColor !== "none"
                );
                const hasRealBg = Boolean(
                  bgColor &&
                  bgColor.toLowerCase() !== "transparent" &&
                  bgColor.toLowerCase() !== "none"
                );

                const isContainer =
                  (hasRealBorder || hasRealBg) &&
                  ((paraNode.width &&
                    paraNode.height &&
                    paraNode.width > 180 &&
                    paraNode.height > 40) ||
                    hasRealBorder);

                if (isContainer) {
                  const insetX = 8;
                  const insetY = 8;
                  const rectX = px + insetX;
                  let rectY = py + insetY;

                  // Defensive clearance: ensure no preceding element touches this container's top border
                  nodes.forEach((other) => {
                    if (other.id === paraNode.id) return;
                    const ox = other.position?.x ?? 0;
                    const oy = other.position?.y ?? 0;
                    const { w: ow, h: oh } = getNodeDimensions(other);
                    const hOverlap =
                      Math.min(px + pw, ox + ow) - Math.max(px, ox);
                    if (hOverlap > 20 && oy + oh > py - 12 && oy + oh <= py + 24) {
                      if (oy + oh + 12 > rectY) {
                        rectY = oy + oh + 12;
                      }
                    }
                  });

                  const rectW = Math.max(pw - insetX * 2, 20);
                  const rectH = Math.max(ph - insetY * 2, 20);

                  const label = paraNode.data?.label || "";
                  const paddingX = 20;
                  const availableW = Math.max(rectW - paddingX * 2, 80);
                  const isLongText = label.length > 45 || label.includes(".");

                  // Wrap text cleanly inside container box using its available width
                  const approxCharW = isLongText ? 6.8 : 7.2;
                  const lines = wrapTextToLines(label, availableW, approxCharW);

                  const fontSize = isLongText ? 12 : 11.5;
                  const lineHeight = isLongText ? 18 : 16;
                  const totalTextH = lines.length * lineHeight;

                  // Text alignment: center for short title, start for multi-line sentences
                  const isCentered =
                    paraNode.data?.style?.textAlign === "center" ||
                    (!isLongText && lines.length === 1);
                  const textX = isCentered
                    ? rectX + rectW / 2
                    : rectX + paddingX;
                  const startY = rectY + 22;

                  return (
                    <g
                      key={paraNode.id}
                      id={`paragraph-container-${paraNode.id}`}
                      pointerEvents="none"
                    >
                      <rect
                        x={rectX}
                        y={rectY}
                        width={rectW}
                        height={rectH}
                        rx={10}
                        fill={isLongText ? "var(--card)" : tone.fill + "06"}
                        stroke={isLongText ? tone.fill + "55" : tone.fill + "40"}
                        strokeWidth={1.8}
                        strokeDasharray={isLongText ? undefined : "4 4"}
                      />
                      {lines.length > 0 && (
                        <text
                          x={textX}
                          y={startY}
                          textAnchor={isCentered ? "middle" : "start"}
                          dominantBaseline="middle"
                          fill={isLongText ? "var(--card-foreground)" : tone.fill}
                          fontSize={fontSize}
                          fontWeight={isLongText ? 500 : 800}
                          letterSpacing={isLongText ? "normal" : "1.2px"}
                          className={cn(
                            "select-none font-sans",
                            !isLongText && "uppercase",
                          )}
                        >
                          {lines.map((line, lIdx) => (
                            <tspan
                              key={lIdx}
                              x={textX}
                              dy={lIdx === 0 ? 0 : lineHeight}
                            >
                              {line}
                            </tspan>
                          ))}
                        </text>
                      )}
                    </g>
                  );
                }

                const lines = wrapTextToLines(
                  paraNode.data?.label || "",
                  Math.max(pw - 8, 140),
                  6.4,
                );
                const lineHeight = 16;
                const isCentered = paraNode.data?.style?.textAlign === "center";

                return (
                  <g
                    key={paraNode.id}
                    id={`paragraph-${paraNode.id}`}
                    pointerEvents="none"
                  >
                    <text
                      x={isCentered ? px + pw / 2 : px}
                      y={py + 14}
                      fill="var(--muted-foreground)"
                      fontSize={11.5}
                      textAnchor={isCentered ? "middle" : "start"}
                      className="font-normal select-none"
                    >
                      {lines.map((line, lIdx) => (
                        <tspan
                          key={lIdx}
                          x={isCentered ? px + pw / 2 : px}
                          dy={lIdx === 0 ? 0 : lineHeight}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}

            {/* LAYER 6: BUTTON NODES (Sleek CTA cards matching roadmap box aesthetic) */}
            {nodes
              .filter((n) => n.type === "button")
              .map((btnNode) => {
                const bx = btnNode.position.x;
                const by = btnNode.position.y;
                const { w: bw, h: bh } = getNodeDimensions(btnNode);
                const isHovered = hoveredNodeId === btnNode.id;
                const label = btnNode.data?.label || "";

                // Inset button slightly to guarantee horizontal and vertical gaps between adjacent buttons
                const gapX = 5;
                const gapY = 3;
                const pillX = bx + gapX;
                const pillY = by + gapY;
                const pillW = bw - gapX * 2;
                const pillH = bh - gapY * 2;
                // Sleek rounded rectangle matching the roadmap box aesthetic (rx=7)
                const rx = 7;

                const fontSize = 11.5;
                const approxTextW = label.length * 6.6;
                const totalContentW = approxTextW + 15;
                const contentStartX = pillX + pillW / 2 - totalContentW / 2;
                const textX = contentStartX + approxTextW / 2;
                const arrowX = contentStartX + approxTextW + 4;
                const arrowY = pillY + pillH / 2;

                const btnTone = tones[hashLabel(label || btnNode.id) % tones.length];

                return (
                  <g
                    key={btnNode.id}
                    id={`btn-${btnNode.id}`}
                    cursor="pointer"
                    onClick={() => handleButtonClick(btnNode)}
                    onMouseEnter={() => setHoveredNodeId(btnNode.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="transition-transform duration-150"
                  >
                    <rect
                      x={pillX}
                      y={pillY}
                      width={pillW}
                      height={pillH}
                      rx={rx}
                      fill={isHovered ? "var(--secondary)" : "var(--card)"}
                      stroke={isHovered ? btnTone.fill : btnTone.fill + "50"}
                      strokeWidth={1.5}
                      className="transition-colors duration-150"
                    />
                    <text
                      x={textX}
                      y={arrowY + 0.8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--card-foreground)"
                      fontSize={fontSize}
                      fontWeight={600}
                    >
                      {label}
                    </text>
                    {/* Clean diagonal external link arrow */}
                    <path
                      d={`M${arrowX} ${arrowY + 3.5} L${arrowX + 6.5} ${arrowY - 3.5} M${arrowX + 2.5} ${arrowY - 3.5} L${arrowX + 6.5} ${arrowY - 3.5} L${arrowX + 6.5} ${arrowY + 0.5}`}
                      fill="none"
                      stroke={isHovered ? btnTone.fill : btnTone.fill + "90"}
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}

            {/* LAYER 7: LEGEND NODES (Temporarily commented out per user request) */}
            {/* {nodes
              .filter((n) => n.type === "legend")
              .map((legendNode) => {
                const lx = legendNode.position.x;
                const ly = legendNode.position.y;
                const { w: lw, h: lh } = getNodeDimensions(legendNode);
                const legends: any[] = legendNode.data?.legends || [];
                const tone = tones[0];

                return (
                  <g
                    key={legendNode.id}
                    id={`legend-${legendNode.id}`}
                    pointerEvents="none"
                  >
                    <rect
                      x={lx}
                      y={ly}
                      width={lw}
                      height={lh}
                      rx={8}
                      fill="var(--card)"
                      stroke="var(--border)"
                      strokeWidth={1.5}
                    />
                    <text
                      x={lx + 16}
                      y={ly + 22}
                      fill={tone.fill}
                      fontSize={10}
                      fontWeight={800}
                      letterSpacing="1px"
                      className="uppercase"
                    >
                      LEGEND
                    </text>
                    {legends.map((item, idx) => {
                      const rowY = ly + 46 + idx * 24;
                      return (
                        <g key={idx}>
                          <circle
                            cx={lx + 22}
                            cy={rowY}
                            r={6}
                            fill={tones[idx % tones.length].fill}
                          />
                          <text
                            x={lx + 36}
                            y={rowY + 1}
                            dominantBaseline="middle"
                            fill="var(--muted-foreground)"
                            fontSize={11}
                            fontWeight={500}
                          >
                            {item.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })} */}

            {/* LAYER 8: LINKS GROUP NODES */}
            {nodes
              .filter((n) => n.type === "linksgroup")
              .map((lgNode) => {
                const gx = lgNode.position.x;
                const gy = lgNode.position.y;
                const { w: gw, h: gh } = getNodeDimensions(lgNode);
                const links: any[] = lgNode.data?.links || [];
                const tone = tones[1];
                const insetX = 8;
                const insetY = 8;
                const rectX = gx + insetX;
                const rectY = gy + insetY;
                const rectW = Math.max(gw - insetX * 2, 20);
                const rectH = Math.max(gh - insetY * 2, 20);

                return (
                  <g key={lgNode.id} id={`linksgroup-${lgNode.id}`}>
                    <rect
                      x={rectX}
                      y={rectY}
                      width={rectW}
                      height={rectH}
                      rx={8}
                      fill="var(--card)"
                      stroke={tone.fill + "55"}
                      strokeWidth={1.5}
                    />
                    <text
                      x={rectX + 16}
                      y={rectY + 24}
                      fill={tone.fill}
                      fontSize={10}
                      fontWeight={800}
                      letterSpacing="1px"
                      className="uppercase"
                    >
                      {lgNode.data?.label || "RELATED ROADMAPS"}
                    </text>
                    {links.map((link, lIdx) => {
                      const rowY = rectY + 52 + lIdx * 28;
                      const rawUrl = link.url || link.href || "";

                      return (
                        <g
                          key={link.id || lIdx}
                          cursor="pointer"
                          onClick={() => {
                            navigateResource(rawUrl, roadmap.slug);
                          }}
                          className="group"
                        >
                          <circle
                            cx={rectX + 24}
                            cy={rowY}
                            r={4}
                            fill={tone.fill}
                            opacity={0.6}
                          />
                          <text
                            x={rectX + 36}
                            y={rowY + 1}
                            dominantBaseline="middle"
                            fill="var(--card-foreground)"
                            fontSize={11.5}
                            fontWeight={500}
                            className="hover:fill-primary transition-colors"
                          >
                            {link.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}

            {/* LAYER 9: TOPICS & SUBTOPICS (Primary Interactive Roadmap Nodes with spacing insets & text wrapping) */}
            {nodes
              .filter((n) => n.type === "topic" || n.type === "subtopic")
              .map((node) => {
                const isTopic = node.type === "topic";
                const nx = node.position.x;
                const ny = node.position.y;
                const { w: nw, h: nh } = getNodeDimensions(node);

                const tone =
                  tones[hashLabel(node.data?.label || node.id) % tones.length];
                const isHovered = hoveredNodeId === node.id;
                const isLearned = learnedMap[String(node.id)] === true;

                // Subtopics dynamically adopt the active theme card color
                let fillColor = isTopic ? tones[0].fill : "var(--card)";
                let strokeColor = isTopic
                  ? tones[0].fill
                  : tone.fill + "80";
                let textColor = isTopic ? "var(--primary-foreground)" : "var(--card-foreground)";
                let strokeWidth = isTopic ? 2 : 1.5;

                // If node has custom style colors from roadmap data
                if (node.data?.style?.colorType === "d") {
                  fillColor = isTopic ? tones[1].fill : "var(--card)";
                  strokeColor = tones[1].fill;
                } else if (node.data?.style?.colorType === "e") {
                  fillColor = isTopic ? tones[2].fill : "var(--card)";
                  strokeColor = tones[2].fill;
                }

                // If user marked as learned: Emerald glow (tones[1].fill)!
                if (isLearned) {
                  fillColor = tones[1].fill;
                  strokeColor = tones[1].fill;
                  textColor = "var(--primary-foreground)";
                  strokeWidth = 2.4;
                }

                // Hover highlight
                if (isHovered) {
                  strokeColor = isLearned ? tones[1].fill : tone.fill;
                  strokeWidth = Math.max(strokeWidth, 2.4);
                }

                // Inset node (4px horizontal, 3.5px vertical) to create generous spacing between adjacent grid boxes
                const gapX = 4;
                const gapY = 3.5;
                const rectX = nx + gapX + strokeWidth / 2;
                const rectY = ny + gapY + strokeWidth / 2;
                const rectW = nw - gapX * 2 - strokeWidth;
                const rectH = nh - gapY * 2 - strokeWidth;

                // Legend dot marker (e.g. Personal Recommendation)
                const legendPos = node.data?.legend
                  ? getNodeLegendPosition(
                      nx,
                      ny,
                      nw,
                      nh,
                      node.data.legend.position,
                    )
                  : null;

                // Text wrapping inside topic box
                const label = node.data?.label || node.title || "";
                // Allow padding for text inside box: 16px horizontal
                // const paddingX = legendPos ? 28 : 16;
                const paddingX = 16;
                const availableTextW = Math.max(rectW - paddingX, 60);

                // Responsive font size and text wrapping
                const baseFontSize = isTopic ? 13 : 11.5;
                const approxCharW = baseFontSize * 0.58;
                const lines = wrapTextToLines(
                  label,
                  availableTextW,
                  approxCharW,
                );

                const isMultiLine = lines.length > 1;
                const fontSize = isMultiLine
                  ? isTopic
                    ? 12
                    : 10.8
                  : baseFontSize;
                const lineHeight = fontSize * 1.25;
                const totalTextH = lines.length * lineHeight;
                const textCenterY =
                  rectY +
                  rectH / 2 -
                  totalTextH / 2 +
                  lineHeight / 2 +
                  (isTopic ? 1 : 0.8);

                return (
                  <g
                    key={node.id}
                    id={`roadmap-node-${node.id}`}
                    cursor="pointer"
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="transition-all duration-150"
                  >
                    {/* Node Rectangle with clean inset for spacing */}
                    <rect
                      x={rectX}
                      y={rectY}
                      width={rectW}
                      height={rectH}
                      rx={6}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="transition-colors duration-150"
                    />

                    {/* Centered Node Label (with multi-line wrapping if needed) */}
                    <text
                      x={nx + nw / 2}
                      y={textCenterY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={textColor}
                      fontSize={fontSize}
                      fontWeight={isTopic ? 700 : 500}
                      letterSpacing={isTopic ? "0.2px" : "normal"}
                      pointerEvents="none"
                    >
                      {lines.map((line, lIdx) => (
                        <tspan
                          key={lIdx}
                          x={nx + nw / 2}
                          dy={lIdx === 0 ? 0 : lineHeight}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>

                    {/* Learned checkmark indicator on top-left if completed (temporarily commented out per user request) */}
                    {/* {isLearned && (
                      <g pointerEvents="none">
                        <circle
                          cx={nx + 13}
                          cy={ny + 13}
                          r={7}
                          fill={tones[1].fill}
                        />
                        <path
                          d={`M${nx + 10} ${ny + 13} L${nx + 12} ${ny + 15} L${nx + 16} ${ny + 11}`}
                          fill="none"
                          stroke="var(--primary-foreground)"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    )} */}

                    {/* Corner Legend Marker (matches roadmap.sh) (temporarily commented out per user request) */}
                    {/* {legendPos && node.data?.legend && (
                      <g className="legend-marker" pointerEvents="none">
                        <circle
                          cx={legendPos.x + 10.5}
                          cy={legendPos.y + 9.5}
                          r={9.5}
                          fill={tones[1].fill}
                        />
                        <path
                          d={`M${legendPos.x + 6.5} ${legendPos.y + 9.5} L${legendPos.x + 9} ${
                            legendPos.y + 12.5
                          } L${legendPos.x + 14} ${legendPos.y + 7.5}`}
                          fill="none"
                          stroke="var(--primary-foreground)"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    )} */}
                  </g>
                );
              })}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default RoadmapCanvas;
