import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  className?: string;
  animate?: boolean;
}

const roleStyles: Record<MessageRole, string> = {
  user: "ml-auto bg-primary/10 border-primary/30 text-foreground",
  assistant: "mr-auto bg-card border-border text-foreground",
  system: "mx-auto bg-muted/50 border-muted-foreground/20 text-muted-foreground text-center",
};

export function MessageBubble({
  role,
  content,
  className,
  animate = true,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[80%] rounded-xl border px-4 py-3 text-base leading-relaxed",
        roleStyles[role],
        animate && "animate-slide-up",
        className
      )}
    >
      {role === "assistant" && (
        <span className="mb-1 block text-xs tracking-wide uppercase text-primary">
          JARVIS
        </span>
      )}
      <p>{content}</p>
    </div>
  );
}
