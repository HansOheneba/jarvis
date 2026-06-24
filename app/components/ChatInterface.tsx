"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpIcon,
  BotIcon,
  PanelLeftCloseIcon,
  PanelLeftIcon,
  Trash2Icon,
  TrendingUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JarvisAvatar, JarvisLogo, MessageBubble, TypingIndicator } from "@/components/custom";
import { JARVIS_METADATA } from "@/lib/jarvis";
import { USER_PREFERENCES } from "@/lib/constants";
import { useChat } from "@/hooks/useChat";
import type { ChatMode } from "@/types/chat";
import type { VectorStoreStatus } from "@/types/rag";
import { cn } from "@/lib/utils";

const SIDEBAR_MODES: {
  id: ChatMode;
  label: string;
  description: string;
  icon: typeof BotIcon;
}[] = [
  {
    id: "general",
    label: "JARVIS",
    description: "General assistant",
    icon: BotIcon,
  },
  {
    id: "personal",
    label: "Financial Advisor",
    description: "Portfolio & wealth analysis",
    icon: TrendingUpIcon,
  },
];

function ChatSidebar({
  activeMode,
  onSelectMode,
  onClose,
  className,
}: {
  activeMode: ChatMode;
  onSelectMode: (mode: ChatMode) => void;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-white/8 bg-[#0a0a0a]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-2.5">
          <JarvisLogo size={32} className="size-7 shrink-0" />
          <span className="truncate font-heading text-sm font-medium tracking-wide text-foreground">
            {JARVIS_METADATA.name}
          </span>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-9 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <PanelLeftCloseIcon className="size-4" />
          </Button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-2" aria-label="Chat mode">
        <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Modes
        </p>
        {SIDEBAR_MODES.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMode(item.id)}
              className={cn(
                "flex min-h-11 w-full touch-manipulation items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{item.label}</span>
                <span className="block truncate text-xs opacity-70">{item.description}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/8 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Built by {JARVIS_METADATA.creator}
        </p>
      </div>
    </aside>
  );
}

function ChatPanel({
  mode,
  onOpenSidebar,
}: {
  mode: ChatMode;
  onOpenSidebar: () => void;
}) {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    handleKeyDown,
    isLoading,
    status,
    canSend,
    hydrated,
    clearChat,
    ragActive,
  } = useChat(mode);

  const [kbStatus, setKbStatus] = useState<VectorStoreStatus | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "personal") return;

    fetch("/api/rag")
      .then((res) => res.json())
      .then((data: VectorStoreStatus) => setKbStatus(data))
      .catch(() => setKbStatus(null));
  }, [mode]);

  const scrollToBottom = useCallback((smooth = false) => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    scrollToBottom(status === "idle");
  }, [messages, status, hydrated, scrollToBottom]);

  const handleClearChat = useCallback(() => {
    if (
      messages.length > 1 &&
      !window.confirm("Clear this conversation? This cannot be undone.")
    ) {
      return;
    }

    clearChat();
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [clearChat, messages.length]);

  const showTypingIndicator =
    USER_PREFERENCES.enableTypingIndicator && status === "loading";

  const placeholder =
    mode === "personal"
      ? "Ask about net worth, goals, cash flow, portfolio..."
      : "Message JARVIS...";

  const title = mode === "personal" ? "Financial Advisor" : JARVIS_METADATA.name;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-black">
      <header className="relative flex min-h-11 shrink-0 items-center justify-center border-b border-white/8 px-3 py-2 pt-[env(safe-area-inset-top)] sm:px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="absolute left-2 top-1/2 size-11 -translate-y-1/2 touch-manipulation text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Open sidebar"
        >
          <PanelLeftIcon className="size-5" />
        </Button>

        <div className="flex max-w-[calc(100%-6rem)] flex-col items-center justify-center md:max-w-none">
          <span className="truncate font-heading text-sm font-medium tracking-wide text-foreground">
            {title}
          </span>
          {mode === "personal" && (kbStatus?.chunkCount ?? 0) > 0 && (
            <p className="mt-0.5 text-[10px] tracking-wide text-muted-foreground sm:text-xs">
              {ragActive ? (
                <span className="text-primary">Analyzing dossier</span>
              ) : (
                <span>Financial dossier · {kbStatus?.chunkCount} sections</span>
              )}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          disabled={isLoading}
          className="absolute right-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 touch-manipulation gap-1.5 px-2.5 text-muted-foreground hover:text-foreground sm:right-3 sm:px-3"
          aria-label="Clear chat"
        >
          <Trash2Icon className="size-4 shrink-0" />
          <span className="hidden text-xs sm:inline sm:text-sm">Clear</span>
        </Button>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto w-full max-w-3xl px-3 py-4 pb-6 sm:px-4 md:px-6">
          {!hydrated ? (
            <div className="flex items-start gap-2.5 py-2 sm:gap-3">
              <JarvisAvatar size={24} className="shrink-0 opacity-50" />
              <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            messages.map((message) => {
              if (message.role === "assistant" && !message.content.trim()) {
                return null;
              }

              if (message.role === "system") {
                return (
                  <div key={message.id} className="py-3">
                    <div className="mx-auto max-w-lg rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                      <MessageBubble
                        role={message.role}
                        content={message.content}
                        animate={false}
                      />
                    </div>
                  </div>
                );
              }

              if (message.role === "assistant") {
                return (
                  <div key={message.id} className="py-2">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <JarvisAvatar size={24} className="shrink-0" />
                      <MessageBubble
                        role={message.role}
                        content={message.content}
                        animate={false}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className="py-2">
                  <MessageBubble
                    role={message.role}
                    content={message.content}
                    animate={false}
                  />
                </div>
              );
            })
          )}

          {hydrated && showTypingIndicator && (
            <div className="py-2">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <JarvisAvatar size={24} className="shrink-0" />
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 shrink-0 border-t border-white/8 bg-black px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 md:px-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-2 rounded-full bg-[#2f2f2f] pl-4"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || !hydrated}
            className="h-10 min-h-11 flex-1 border-0 text-base shadow-none focus-visible:ring-0 sm:h-9 sm:min-h-0 sm:text-sm"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            className="m-1 size-11 shrink-0 touch-manipulation rounded-full sm:size-9"
            aria-label="Send message"
          >
            <ArrowUpIcon />
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
          JARVIS can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [activeMode, setActiveMode] = useState<ChatMode>("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectMode = useCallback((mode: ChatMode) => {
    setActiveMode(mode);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-black">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <ChatSidebar activeMode={activeMode} onSelectMode={selectMode} />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <ChatSidebar
          activeMode={activeMode}
          onSelectMode={selectMode}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main chat */}
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatPanel
          key={activeMode}
          mode={activeMode}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  );
}
