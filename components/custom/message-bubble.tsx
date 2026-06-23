import { cn } from "@/lib/utils";
import { ADMIN_CONTACT_EMAIL } from "@/lib/jarvis";
import type { MessageRole } from "@/types";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  className?: string;
  animate?: boolean;
}

const roleStyles: Record<MessageRole, string> = {
  user: "ml-auto max-w-[75%] rounded-3xl bg-[#2f2f2f] px-4 py-2.5 text-foreground",
  assistant: "mr-auto max-w-full text-foreground",
  system: "mx-auto max-w-full text-center text-sm leading-relaxed text-muted-foreground",
};

function renderSystemContent(content: string) {
  if (!content.includes(ADMIN_CONTACT_EMAIL)) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  const [before, after] = content.split(ADMIN_CONTACT_EMAIL);

  return (
    <p className="whitespace-pre-wrap">
      {before}
      <a
        href={`mailto:${ADMIN_CONTACT_EMAIL}`}
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {ADMIN_CONTACT_EMAIL}
      </a>
      {after}
    </p>
  );
}

export function MessageBubble({
  role,
  content,
  className,
  animate = false,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "text-base leading-relaxed",
        roleStyles[role],
        animate && "animate-slide-up",
        className
      )}
    >
      {role === "system" ? renderSystemContent(content) : (
        <p className="whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}
