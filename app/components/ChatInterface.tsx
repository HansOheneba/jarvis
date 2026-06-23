"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowUpIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JarvisAvatar, JarvisLogo, MessageBubble, TypingIndicator } from "@/components/custom";
import { JARVIS_METADATA } from "@/lib/jarvis";
import { USER_PREFERENCES } from "@/lib/constants";
import { useChat } from "@/hooks/useChat";

export function ChatInterface() {
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
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black">
      <div className="sticky top-0 z-20 shrink-0 border-b border-white/8 bg-black pt-[env(safe-area-inset-top)]">
        <header className="relative flex min-h-11 items-center justify-center px-3 py-2 sm:px-4">
          <div className="flex max-w-[calc(100%-5.5rem)] items-center justify-center gap-2 sm:max-w-none sm:gap-2.5">
            <JarvisLogo size={40} className="size-7 shrink-0 sm:size-8" />
            <span className="truncate font-heading text-sm font-medium tracking-wide text-foreground">
              {JARVIS_METADATA.name}
            </span>
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
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-black"
      >
        <div className="mx-auto w-full max-w-3xl px-3 py-4 pb-6 sm:px-4 md:px-6">
          {messages.map((message) => {
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
          })}

          {showTypingIndicator && (
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
          className="mx-auto flex max-w-3xl items-center gap-2 rounded-full bg-[#2f2f2f] p-2 pl-4"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message JARVIS..."
            disabled={isLoading}
            className="h-10 min-h-11 flex-1 border-0 px-0 text-base shadow-none focus-visible:ring-0 sm:h-9 sm:min-h-0 sm:text-sm"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            className="size-11 shrink-0 touch-manipulation rounded-full sm:size-9"
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
