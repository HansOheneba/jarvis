import { cn } from "@/lib/utils";
import { ADMIN_CONTACT_EMAIL } from "@/lib/jarvis";
import { MarkdownContent } from "@/components/custom/markdown-content";
import type { MessageRole } from "@/types";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  className?: string;
  animate?: boolean;
}

const roleStyles: Record<MessageRole, string> = {
  user: "ml-auto max-w-[75%] rounded-3xl bg-[#2f2f2f] px-4 py-2.5 text-foreground",
  assistant: "min-w-0 flex-1 text-foreground",
  system: "mx-auto max-w-full text-center text-sm leading-relaxed text-muted-foreground",
};

const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]"'])/g;

function isUrl(text: string): boolean {
  return text.startsWith("http://") || text.startsWith("https://");
}

function renderUserContent(content: string) {
  const parts = content.split(URL_PATTERN);

  return (
    <p className="break-words whitespace-pre-wrap">
      {parts.map((part, index) =>
        isUrl(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline decoration-primary/50 underline-offset-2 hover:text-primary/80"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  );
}

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
      {role === "system" && renderSystemContent(content)}
      {role === "assistant" && <MarkdownContent content={content} />}
      {role === "user" && renderUserContent(content)}
    </div>
  );
}
