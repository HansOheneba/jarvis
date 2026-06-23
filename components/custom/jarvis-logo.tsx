import { cn } from "@/lib/utils";

interface JarvisLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function JarvisLogo({
  className,
  size = 48,
  animated = true,
}: JarvisLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-label="JARVIS"
      role="img"
      className={cn(animated && "animate-pulse-glow", className)}
    >
      <defs>
        <linearGradient id="jarvis-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00B4FF" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
        <radialGradient id="jarvis-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00B4FF" stopOpacity="1" />
          <stop offset="70%" stopColor="#0088CC" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0D0D0D" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer ring */}
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="url(#jarvis-ring)"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Middle ring */}
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="none"
        stroke="#00B4FF"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Arc reactor core */}
      <circle cx="32" cy="32" r="12" fill="url(#jarvis-core)" />

      {/* Inner glow */}
      <circle cx="32" cy="32" r="6" fill="#00B4FF" opacity="0.9" />
      <circle cx="32" cy="32" r="3" fill="#FFD700" opacity="0.8" />

      {/* Crosshair lines */}
      <line
        x1="32"
        y1="8"
        x2="32"
        y2="16"
        stroke="#00B4FF"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="32"
        y1="48"
        x2="32"
        y2="56"
        stroke="#00B4FF"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="8"
        y1="32"
        x2="16"
        y2="32"
        stroke="#00B4FF"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="48"
        y1="32"
        x2="56"
        y2="32"
        stroke="#00B4FF"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
