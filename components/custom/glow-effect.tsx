import { cn } from "@/lib/utils";

interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}

export function GlowEffect({ children, className, strong = false }: GlowEffectProps) {
  return (
    <div
      className={cn(strong ? "glow-accent-strong" : "glow-accent", className)}
    >
      {children}
    </div>
  );
}
