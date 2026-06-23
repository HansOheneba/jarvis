import { cn } from "@/lib/utils";
import type { StatusState } from "@/types";

interface StatusDotProps {
  status?: StatusState;
  label?: string;
  className?: string;
  showLabel?: boolean;
}

const statusColors: Record<StatusState, string> = {
  online: "bg-primary",
  offline: "bg-muted-foreground",
  busy: "bg-secondary",
  typing: "bg-primary",
};

const statusLabels: Record<StatusState, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  typing: "Typing",
};

export function StatusDot({
  status = "online",
  label,
  className,
  showLabel = true,
}: StatusDotProps) {
  const displayLabel = label ?? statusLabels[status];
  const shouldBlink = status === "online" || status === "typing";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "size-2 rounded-full",
          statusColors[status],
          shouldBlink && "animate-blink"
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-xs tracking-wide uppercase text-muted-foreground">
          {displayLabel}
        </span>
      )}
    </div>
  );
}
