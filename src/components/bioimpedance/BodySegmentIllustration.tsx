"use client";

import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Segment trend data with semantic color mapping
 */
export interface SegmentTrendData {
  segment: "armLeft" | "armRight" | "legLeft" | "legRight" | "torso";
  currentValue: number;
  previousValue: number;
  percentChange: number; // -4.0 to +9.5
  type: "muscle" | "fat" | "water" | "concern" | "stable";
  hasSignificantChange: boolean;
}

export interface BodySegmentIllustrationProps {
  /**
   * Array of segment trends to display
   */
  segments: SegmentTrendData[];

  /**
   * Avatar gender: "neutral" (default), "feminine", "masculine"
   */
  gender?: "neutral" | "feminine" | "masculine";

  /**
   * Current analysis mode
   */
  mode?: "leanMass" | "fat" | "water";

  /**
   * Callback when segment is clicked
   */
  onSegmentClick?: (segment: SegmentTrendData) => void;

  /**
   * Is data loading?
   */
  isLoading?: boolean;

  /**
   * Container class name
   */
  className?: string;

  /**
   * SVG viewBox size
   */
  size?: "sm" | "md" | "lg";
}

/**
 * Semantic color palette from spec
 */
const SEMANTIC_COLORS = {
  muscle: "#10B981", // Emerald Green - Muscle gain
  fat: "#F59E0B", // Warm Amber - Fat loss
  water: "#3B82F6", // Clinical Blue - Hydration
  concern: "#EF4444", // Soft Red - Needs attention
  stable: "#9CA3AF", // Neutral Gray - No change
  excellent: "#059669", // Deep Green - Goal achieved
} as const;

/**
 * SVG sizes for responsive design
 */
const SIZE_CONFIG = {
  sm: { width: 120, height: 300, scale: 0.8 },
  md: { width: 160, height: 400, scale: 1 },
  lg: { width: 200, height: 500, scale: 1.2 },
} as const;

/**
 * BodySegmentIllustration: Modern, warm human figure with colorized segments
 *
 * Features:
 * - Gender-switchable avatar (neutral/feminine/masculine)
 * - Pulse animation on significant changes
 * - Click to expand segment details
 * - Semantic color mapping
 * - WCAG AA accessible (ARIA labels)
 * - Responsive SVG
 */
const BodySegmentIllustration = forwardRef<
  SVGSVGElement,
  BodySegmentIllustrationProps
>(
  (
    {
      segments,
      gender = "neutral",
      mode = "leanMass",
      onSegmentClick,
      isLoading = false,
      className,
      size = "md",
    },
    ref
  ) => {
    const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

    // Initialize random delays once per segment
    const [segmentDelays] = useState<Record<string, number>>(() => {
      const delays: Record<string, number> = {};
      segments.forEach((seg) => {
        delays[seg.segment] = 0.5 + Math.random() * 0.2;
      });
      return delays;
    });

    // Map segments to color based on trend type
    const segmentColors = useMemo(() => {
      const colors: Record<string, string> = {};
      segments.forEach((seg) => {
        colors[seg.segment] = SEMANTIC_COLORS[seg.type];
      });
      return colors;
    }, [segments]);

    // Segments with significant changes (for pulse animation)
    const significantSegments = useMemo(() => {
      return segments.filter((s) => s.hasSignificantChange).map((s) => s.segment);
    }, [segments]);

    // Premium gradient IDs per type - must be before any early returns
    const gradIds = useMemo(() => ({
      muscle: "grad-muscle",
      fat: "grad-fat",
      water: "grad-water",
      concern: "grad-concern",
      stable: "grad-stable",
    }), []);

    // Get segment data by name
    const getSegmentData = (name: string): SegmentTrendData | undefined => {
      return segments.find((s) => s.segment === name);
    };

    const sizeConfig = SIZE_CONFIG[size];
    const viewBoxSize = `0 0 ${sizeConfig.width} ${sizeConfig.height}`;

    // Loading skeleton
    if (isLoading) {
      return (
        <div className={cn("flex justify-center items-center", className)}>
          <svg
            viewBox={viewBoxSize}
            className={cn(
              "animate-pulse",
              size === "sm" && "h-60 w-24",
              size === "md" && "h-[26rem] w-44",
              size === "lg" && "h-[34rem] w-56"
            )}
            aria-busy="true"
            aria-label="Carregando ilustração do corpo"
          >
            {/* Placeholder skeleton */}
            <circle cx={sizeConfig.width / 2} cy="30" r="15" fill="#E5E7EB" />
            <ellipse cx={sizeConfig.width / 2} cy="90" rx="25" ry="50" fill="#E5E7EB" />
            <ellipse cx={sizeConfig.width / 2 + 35} cy="70" rx="8" ry="30" fill="#E5E7EB" />
            <ellipse cx={sizeConfig.width / 2 - 35} cy="70" rx="8" ry="30" fill="#E5E7EB" />
            <ellipse cx={sizeConfig.width / 2 + 25} cy="170" rx="10" ry="50" fill="#E5E7EB" />
            <ellipse cx={sizeConfig.width / 2 - 25} cy="170" rx="10" ry="50" fill="#E5E7EB" />
          </svg>
        </div>
      );
    }

    // Scale multiplier for coordinate calculations
    const s = sizeConfig.scale;
    const cx = sizeConfig.width / 2; // 80 for md

    const getGradId = (segName: string) => {
      const seg = segments.find((s) => s.segment === segName);
      const type = seg?.type ?? "stable";
      return `url(#${gradIds[type]})`;
    };

    // Get consistent random delay for segment animation
    const getSegmentDelay = (segName: string) => {
      return segmentDelays[segName] ?? 0.5;
    };

    return (
      <div className={cn("relative flex flex-col items-center gap-4", className)}>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          {(Object.entries({
            muscle: "Ganho muscular",
            fat: "Redução gordura",
            water: "Hidratação",
            concern: "Atenção",
            stable: "Estável",
          }) as [keyof typeof SEMANTIC_COLORS, string][]).map(([type, label]) => {
            const isActive = segments.some((seg) => seg.type === type);
            if (!isActive) return null;
            return (
              <span key={type} className="flex items-center gap-1.5 font-medium">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: SEMANTIC_COLORS[type] }}
                />
                <span className="text-gray-600">{label}</span>
              </span>
            );
          })}
        </div>

        {/* SVG Body */}
        <div className="relative">
          <svg
            ref={ref}
            viewBox={`0 0 ${sizeConfig.width} ${sizeConfig.height}`}
            className={cn(
              "drop-shadow-sm transition-transform duration-300",
              size === "sm" && "h-60 w-24",
              size === "md" && "h-[26rem] w-44",
              size === "lg" && "h-[34rem] w-56"
            )}
            role="img"
            aria-label={`Ilustração da composição corporal - ${mode === "leanMass" ? "Massa Magra" : "Gordura"}`}
            aria-describedby="body-analysis-desc"
          >
            <defs>
              {/* ── Radial gradients per segment type – light center → richer edge ── */}
              {(Object.entries(SEMANTIC_COLORS) as [string, string][]).map(([type, color]) => (
                <radialGradient
                  key={type}
                  id={`grad-${type}`}
                  cx="38%"
                  cy="28%"
                  r="68%"
                  fx="38%"
                  fy="28%"
                >
                  <stop offset="0%" stopColor={color} stopOpacity="0.55" />
                  <stop offset="55%" stopColor={color} stopOpacity="0.82" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.95" />
                </radialGradient>
              ))}

              {/* Gradient for neutral body base (skin tone) */}
              <radialGradient id="grad-body" cx="38%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#e5d3c8" stopOpacity="1" />
                <stop offset="100%" stopColor="#c4a898" stopOpacity="1" />
              </radialGradient>

              {/* Head gradient */}
              <radialGradient id="grad-head" cx="42%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#f0dfd6" />
                <stop offset="100%" stopColor="#c8a898" />
              </radialGradient>

              {/* White highlight overlay (sheen) */}
              <radialGradient id="highlight" cx="35%" cy="25%" r="55%">
                <stop offset="0%" stopColor="white" stopOpacity="0.45" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>

              {/* Drop shadow filter */}
              <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00000025" />
              </filter>

              {/* Glow filter for significant changes */}
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Clip paths for clean segment edges */}
              <clipPath id="clip-torso">
                <path d={`M ${cx - 4},${57 * s} C ${cx - 12},${57 * s} ${cx - 44},${64 * s} ${cx - 44},${94 * s} C ${cx - 44},${128 * s} ${cx - 30},${152 * s} ${cx - 32},${170 * s} L ${cx - 22},${178 * s} L ${cx},${176 * s} L ${cx + 22},${178 * s} C ${cx + 30},${168 * s} ${cx + 44},${144 * s} ${cx + 44},${110 * s} C ${cx + 44},${76 * s} ${cx + 12},${57 * s} ${cx + 4},${57 * s} Z`} />
              </clipPath>
            </defs>

            {/* ── GHOST BODY OUTLINE – subtle background silhouette ── */}
            <g opacity="0.12" fill="#78716c" aria-hidden="true">
              {/* Ghost head */}
              <circle cx={cx} cy={22 * s} r={19 * s} />
              {/* Ghost neck */}
              <rect x={cx - 6} y={41 * s} width={12 * s} height={14 * s} rx={3} />
              {/* Ghost torso */}
              <path d={`M ${cx - 4},${55 * s} C ${cx - 12},${55 * s} ${cx - 46},${62 * s} ${cx - 46},${92 * s} C ${cx - 46},${132 * s} ${cx - 30},${154 * s} ${cx - 32},${172 * s} L ${cx - 22},${180 * s} L ${cx},${178 * s} L ${cx + 22},${180 * s} C ${cx + 30},${170 * s} ${cx + 46},${148 * s} ${cx + 46},${112 * s} C ${cx + 46},${74 * s} ${cx + 12},${55 * s} ${cx + 4},${55 * s} Z`} />
              {/* Ghost left arm */}
              <ellipse cx={cx - 54 * s} cy={90 * s} rx={9 * s} ry={32 * s} transform={`rotate(-7 ${cx - 54 * s} ${90 * s})`} />
              <ellipse cx={cx - 58 * s} cy={136 * s} rx={7 * s} ry={26 * s} transform={`rotate(-10 ${cx - 58 * s} ${136 * s})`} />
              {/* Ghost right arm */}
              <ellipse cx={cx + 54 * s} cy={90 * s} rx={9 * s} ry={32 * s} transform={`rotate(7 ${cx + 54 * s} ${90 * s})`} />
              <ellipse cx={cx + 58 * s} cy={136 * s} rx={7 * s} ry={26 * s} transform={`rotate(10 ${cx + 58 * s} ${136 * s})`} />
              {/* Ghost left leg */}
              <ellipse cx={cx - 17 * s} cy={218 * s} rx={12 * s} ry={40 * s} />
              <ellipse cx={cx - 18 * s} cy={284 * s} rx={9 * s} ry={32 * s} />
              <ellipse cx={cx - 20 * s} cy={328 * s} rx={11 * s} ry={9 * s} />
              {/* Ghost right leg */}
              <ellipse cx={cx + 17 * s} cy={218 * s} rx={12 * s} ry={40 * s} />
              <ellipse cx={cx + 18 * s} cy={284 * s} rx={9 * s} ry={32 * s} />
              <ellipse cx={cx + 20 * s} cy={328 * s} rx={11 * s} ry={9 * s} />
            </g>

            {/* ── HEAD ── */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.05 }}
              style={{ transformOrigin: `${cx}px ${22 * s}px` }}
            >
              <circle cx={cx} cy={22 * s} r={19 * s} fill="url(#grad-head)" filter="url(#shadow)" />
              {/* Highlight sheen on head */}
              <ellipse cx={cx - 5 * s} cy={16 * s} rx={9 * s} ry={7 * s} fill="url(#highlight)" />
            </motion.g>

            {/* ── NECK ── */}
            <motion.rect
              x={cx - 6}
              y={41 * s}
              width={12 * s}
              height={15 * s}
              rx={4}
              fill="url(#grad-body)"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.1 }}
              aria-hidden="true"
            />

            {/* ── TORSO ── */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.15 }}
              style={{ transformOrigin: `${cx}px ${115 * s}px` }}
              onClick={() => {
                const data = getSegmentData("torso");
                if (data) {
                  setExpandedSegment(expandedSegment === "torso" ? null : "torso");
                  onSegmentClick?.(data);
                }
              }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Tronco"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  const data = getSegmentData("torso");
                  if (data) {
                    setExpandedSegment(expandedSegment === "torso" ? null : "torso");
                    onSegmentClick?.(data);
                  }
                }
              }}
            >
              {/* Shoulder band */}
              <path
                d={`M ${cx - 4},${55 * s} C ${cx - 12},${55 * s} ${cx - 46},${62 * s} ${cx - 46},${92 * s} C ${cx - 46},${132 * s} ${cx - 30},${155 * s} ${cx - 32},${172 * s} L ${cx - 22},${180 * s} L ${cx},${178 * s} L ${cx + 22},${180 * s} C ${cx + 30},${168 * s} ${cx + 46},${148 * s} ${cx + 46},${112 * s} C ${cx + 46},${74 * s} ${cx + 12},${55 * s} ${cx + 4},${55 * s} Z`}
                fill={getGradId("torso")}
                filter={significantSegments.includes("torso") ? "url(#glow)" : "url(#shadow)"}
                stroke="white"
                strokeWidth="0.8"
                strokeOpacity="0.3"
              />
              {/* Torso highlight sheen */}
              <ellipse cx={cx - 8 * s} cy={80 * s} rx={18 * s} ry={24 * s} fill="url(#highlight)" />
              {/* Subtle mid-line */}
              <line
                x1={cx}
                y1={60 * s}
                x2={cx}
                y2={170 * s}
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.2"
              />

              {significantSegments.includes("torso") && (
                <motion.circle
                  cx={cx}
                  cy={110 * s}
                  r={36 * s}
                  fill="none"
                  stroke={segmentColors.torso ?? SEMANTIC_COLORS.stable}
                  strokeWidth="2"
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  aria-hidden="true"
                />
              )}
            </motion.g>

            {/* ── LEFT ARM (SVG left = patient left) ── */}
            <motion.g
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 }}
              onClick={() => {
                const data = getSegmentData("armLeft");
                if (data) {
                  setExpandedSegment(expandedSegment === "armLeft" ? null : "armLeft");
                  onSegmentClick?.(data);
                }
              }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Braço esquerdo"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  const data = getSegmentData("armLeft");
                  if (data) {
                    setExpandedSegment(expandedSegment === "armLeft" ? null : "armLeft");
                    onSegmentClick?.(data);
                  }
                }
              }}
            >
              {/* Upper arm – rotated outward */}
              <ellipse
                cx={cx - 54 * s}
                cy={90 * s}
                rx={9 * s}
                ry={30 * s}
                fill={getGradId("armLeft")}
                filter={significantSegments.includes("armLeft") ? "url(#glow)" : "url(#shadow)"}
                stroke="white"
                strokeWidth="0.6"
                strokeOpacity="0.3"
                transform={`rotate(-7 ${cx - 54 * s} ${90 * s})`}
              />
              <ellipse
                cx={cx - 54 * s}
                cy={82 * s}
                rx={5 * s}
                ry={10 * s}
                fill="url(#highlight)"
                transform={`rotate(-7 ${cx - 54 * s} ${82 * s})`}
              />
              {/* Forearm */}
              <ellipse
                cx={cx - 58 * s}
                cy={134 * s}
                rx={7 * s}
                ry={25 * s}
                fill={getGradId("armLeft")}
                filter="url(#shadow)"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.25"
                transform={`rotate(-10 ${cx - 58 * s} ${134 * s})`}
              />
              {/* Hand */}
              <ellipse
                cx={cx - 62 * s}
                cy={165 * s}
                rx={6 * s}
                ry={9 * s}
                fill={getGradId("armLeft")}
                filter="url(#shadow)"
                transform={`rotate(-10 ${cx - 62 * s} ${165 * s})`}
              />

              {significantSegments.includes("armLeft") && (
                <motion.circle
                  cx={cx - 54 * s}
                  cy={90 * s}
                  r={14 * s}
                  fill="none"
                  stroke={segmentColors.armLeft ?? SEMANTIC_COLORS.stable}
                  strokeWidth="2"
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.2 }}
                  aria-hidden="true"
                />
              )}
            </motion.g>

            {/* ── RIGHT ARM (SVG right = patient right) ── */}
            <motion.g
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 }}
              onClick={() => {
                const data = getSegmentData("armRight");
                if (data) {
                  setExpandedSegment(expandedSegment === "armRight" ? null : "armRight");
                  onSegmentClick?.(data);
                }
              }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Braço direito"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  const data = getSegmentData("armRight");
                  if (data) {
                    setExpandedSegment(expandedSegment === "armRight" ? null : "armRight");
                    onSegmentClick?.(data);
                  }
                }
              }}
            >
              {/* Upper arm */}
              <ellipse
                cx={cx + 54 * s}
                cy={90 * s}
                rx={9 * s}
                ry={30 * s}
                fill={getGradId("armRight")}
                filter={significantSegments.includes("armRight") ? "url(#glow)" : "url(#shadow)"}
                stroke="white"
                strokeWidth="0.6"
                strokeOpacity="0.3"
                transform={`rotate(7 ${cx + 54 * s} ${90 * s})`}
              />
              <ellipse
                cx={cx + 54 * s}
                cy={82 * s}
                rx={5 * s}
                ry={10 * s}
                fill="url(#highlight)"
                transform={`rotate(7 ${cx + 54 * s} ${82 * s})`}
              />
              {/* Forearm */}
              <ellipse
                cx={cx + 58 * s}
                cy={134 * s}
                rx={7 * s}
                ry={25 * s}
                fill={getGradId("armRight")}
                filter="url(#shadow)"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.25"
                transform={`rotate(10 ${cx + 58 * s} ${134 * s})`}
              />
              {/* Hand */}
              <ellipse
                cx={cx + 62 * s}
                cy={165 * s}
                rx={6 * s}
                ry={9 * s}
                fill={getGradId("armRight")}
                filter="url(#shadow)"
                transform={`rotate(10 ${cx + 62 * s} ${165 * s})`}
              />

              {significantSegments.includes("armRight") && (
                <motion.circle
                  cx={cx + 54 * s}
                  cy={90 * s}
                  r={14 * s}
                  fill="none"
                  stroke={segmentColors.armRight ?? SEMANTIC_COLORS.stable}
                  strokeWidth="2"
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.2 }}
                  aria-hidden="true"
                />
              )}
            </motion.g>

            {/* ── LEFT LEG ── */}
            <motion.g
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              onClick={() => {
                const data = getSegmentData("legLeft");
                if (data) {
                  setExpandedSegment(expandedSegment === "legLeft" ? null : "legLeft");
                  onSegmentClick?.(data);
                }
              }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Perna esquerda"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  const data = getSegmentData("legLeft");
                  if (data) {
                    setExpandedSegment(expandedSegment === "legLeft" ? null : "legLeft");
                    onSegmentClick?.(data);
                  }
                }
              }}
            >
              {/* Thigh */}
              <ellipse
                cx={cx - 17 * s}
                cy={218 * s}
                rx={12 * s}
                ry={38 * s}
                fill={getGradId("legLeft")}
                filter={significantSegments.includes("legLeft") ? "url(#glow)" : "url(#shadow)"}
                stroke="white"
                strokeWidth="0.6"
                strokeOpacity="0.28"
              />
              <ellipse cx={cx - 20 * s} cy={206 * s} rx={6 * s} ry={12 * s} fill="url(#highlight)" />
              {/* Calf */}
              <ellipse
                cx={cx - 18 * s}
                cy={280 * s}
                rx={9 * s}
                ry={30 * s}
                fill={getGradId("legLeft")}
                filter="url(#shadow)"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.22"
              />
              {/* Foot */}
              <ellipse
                cx={cx - 20 * s}
                cy={325 * s}
                rx={12 * s}
                ry={8 * s}
                fill={getGradId("legLeft")}
                filter="url(#shadow)"
              />

              {significantSegments.includes("legLeft") && (
                <motion.circle
                  cx={cx - 17 * s}
                  cy={218 * s}
                  r={17 * s}
                  fill="none"
                  stroke={segmentColors.legLeft ?? SEMANTIC_COLORS.stable}
                  strokeWidth="2"
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
                  aria-hidden="true"
                />
              )}
            </motion.g>

            {/* ── RIGHT LEG ── */}
            <motion.g
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              onClick={() => {
                const data = getSegmentData("legRight");
                if (data) {
                  setExpandedSegment(expandedSegment === "legRight" ? null : "legRight");
                  onSegmentClick?.(data);
                }
              }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Perna direita"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  const data = getSegmentData("legRight");
                  if (data) {
                    setExpandedSegment(expandedSegment === "legRight" ? null : "legRight");
                    onSegmentClick?.(data);
                  }
                }
              }}
            >
              {/* Thigh */}
              <ellipse
                cx={cx + 17 * s}
                cy={218 * s}
                rx={12 * s}
                ry={38 * s}
                fill={getGradId("legRight")}
                filter={significantSegments.includes("legRight") ? "url(#glow)" : "url(#shadow)"}
                stroke="white"
                strokeWidth="0.6"
                strokeOpacity="0.28"
              />
              <ellipse cx={cx + 14 * s} cy={206 * s} rx={6 * s} ry={12 * s} fill="url(#highlight)" />
              {/* Calf */}
              <ellipse
                cx={cx + 18 * s}
                cy={280 * s}
                rx={9 * s}
                ry={30 * s}
                fill={getGradId("legRight")}
                filter="url(#shadow)"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.22"
              />
              {/* Foot */}
              <ellipse
                cx={cx + 20 * s}
                cy={325 * s}
                rx={12 * s}
                ry={8 * s}
                fill={getGradId("legRight")}
                filter="url(#shadow)"
              />

              {significantSegments.includes("legRight") && (
                <motion.circle
                  cx={cx + 17 * s}
                  cy={218 * s}
                  r={17 * s}
                  fill="none"
                  stroke={segmentColors.legRight ?? SEMANTIC_COLORS.stable}
                  strokeWidth="2"
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
                  aria-hidden="true"
                />
              )}
            </motion.g>

            {/* ── FLOATING SEGMENT VALUE LABELS ── */}
            {segments.map((seg) => {
              const labelPositions: Record<string, { x: number; y: number; anchor: string }> = {
                armLeft:  { x: cx - 80 * s, y: 90 * s,  anchor: "end" },
                armRight: { x: cx + 80 * s, y: 90 * s,  anchor: "start" },
                torso:    { x: cx + 58 * s, y: 115 * s, anchor: "start" },
                legLeft:  { x: cx - 38 * s, y: 218 * s, anchor: "end" },
                legRight: { x: cx + 38 * s, y: 218 * s, anchor: "start" },
              };
              const pos = labelPositions[seg.segment];
              if (!pos) return null;
              const color = SEMANTIC_COLORS[seg.type];
              const change = seg.percentChange;
              const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
              return (
                <motion.g
                  key={seg.segment}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: getSegmentDelay(seg.segment) }}
                >
                  {/* Label background pill */}
                  <rect
                    x={pos.anchor === "end" ? pos.x - 46 * s : pos.x}
                    y={pos.y - 10 * s}
                    width={46 * s}
                    height={20 * s}
                    rx={10 * s}
                    fill={color}
                    fillOpacity="0.15"
                    stroke={color}
                    strokeWidth="0.8"
                    strokeOpacity="0.5"
                  />
                  <text
                    x={pos.anchor === "end" ? pos.x - 23 * s : pos.x + 23 * s}
                    y={pos.y + 4 * s}
                    textAnchor="middle"
                    fill={color}
                    fontSize={8 * s}
                    fontWeight="700"
                    fontFamily="system-ui, sans-serif"
                  >
                    {seg.currentValue.toFixed(1)}kg {arrow}{Math.abs(change).toFixed(1)}%
                  </text>
                </motion.g>
              );
            })}
          </svg>

          {/* Expanded segment details card */}
          <AnimatePresence>
            {expandedSegment && (
              <motion.div
                key={expandedSegment}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
              >
                {getSegmentData(expandedSegment) && (
                  <SegmentDetailCard segment={getSegmentData(expandedSegment)!} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden description for screen readers */}
        <p id="body-analysis-desc" className="sr-only">
          Ilustração segmentada do corpo humano mostrando análise de composição corporal com cores semânticas: verde para ganho de massa magra, âmbar para perda de gordura, azul para hidratação, vermelho para áreas de atenção, e cinza para segmentos estáveis. Clique em cada segmento para ver detalhes.
        </p>
      </div>
    );
  }
);

BodySegmentIllustration.displayName = "BodySegmentIllustration";

/**
 * Detail card component for expanded segment info
 */
function SegmentDetailCard({ segment }: { segment: SegmentTrendData }) {
  const segmentLabel = {
    armLeft: "Braço Esquerdo",
    armRight: "Braço Direito",
    legLeft: "Perna Esquerda",
    legRight: "Perna Direita",
    torso: "Tronco",
  }[segment.segment];

  const typeLabel = {
    muscle: "Ganho de Massa Magra",
    fat: "Perda de Gordura",
    water: "Hidratação",
    concern: "Requer Atenção",
    stable: "Estável",
  }[segment.type];

  const directionIcon = segment.percentChange > 0 ? "↑" : segment.percentChange < 0 ? "↓" : "→";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">{segmentLabel}</h4>
        <span className={cn("text-sm font-medium", {
          "text-emerald-600": segment.type === "muscle",
          "text-amber-600": segment.type === "fat",
          "text-blue-600": segment.type === "water",
          "text-red-600": segment.type === "concern",
          "text-gray-600": segment.type === "stable",
        })}>
          {typeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Valor Anterior</p>
          <p className="text-lg font-bold text-gray-900">{segment.previousValue.toFixed(2)} kg</p>
        </div>
        <div>
          <p className="text-gray-600">Valor Atual</p>
          <p className="text-lg font-bold text-gray-900">{segment.currentValue.toFixed(2)} kg</p>
        </div>
      </div>

      <div className={cn("rounded-lg p-3 text-center text-sm font-semibold", {
        "bg-emerald-50 text-emerald-700": segment.type === "muscle",
        "bg-amber-50 text-amber-700": segment.type === "fat",
        "bg-blue-50 text-blue-700": segment.type === "water",
        "bg-red-50 text-red-700": segment.type === "concern",
        "bg-gray-50 text-gray-700": segment.type === "stable",
      })}>
        {directionIcon} {segment.percentChange > 0 ? "+" : ""}{segment.percentChange.toFixed(1)}%
      </div>
    </div>
  );
}

export { BodySegmentIllustration };
export type { BodySegmentIllustrationProps, SegmentTrendData };
