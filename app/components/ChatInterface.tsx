"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowUpIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { JarvisLogo, MessageBubble, TypingIndicator } from "@/components/custom";
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
  } = useChat();

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  const showTypingIndicator =
    USER_PREFERENCES.enableTypingIndicator && status === "loading";

  return (
    <div className="flex h-dvh flex-col bg-black">
      <header className="flex h-12 shrink-0 items-center justify-center">
        <div className="flex items-center gap-2">
          <JarvisLogo size={20} animated={false} />
          <span className="font-heading text-sm font-medium tracking-wide text-foreground">
            {JARVIS_METADATA.name}
          </span>
        </div>
      </header>

      <Separator className="bg-white/8" />

      <ScrollArea className="flex-1 bg-black">
        <div className="mx-auto w-full max-w-3xl py-4">
          {messages.map((message) => {
            if (message.role === "assistant" && !message.content.trim()) {
              return null;
            }

            if (message.role === "system") {
              return (
                <div key={message.id} className="px-4 py-3 md:px-6">
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
                <div key={message.id} className="px-4 py-2 md:px-6">
                  <div className="flex gap-3">
                    <Avatar size="sm" className="mt-1 after:border-white/8">
                      <AvatarFallback className="bg-[#2f2f2f] text-xs text-foreground">
                        J
                      </AvatarFallback>
                    </Avatar>
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
              <div key={message.id} className="px-4 py-2 md:px-6">
                <MessageBubble
                  role={message.role}
                  content={message.content}
                  animate={false}
                />
              </div>
            );
          })}

          {showTypingIndicator && (
            <div className="px-4 py-2 md:px-6">
              <div className="flex gap-3">
                <Avatar size="sm" className="mt-1 after:border-white/8">
                  <AvatarFallback className="bg-[#2f2f2f] text-xs text-foreground">
                    J
                  </AvatarFallback>
                </Avatar>
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" aria-hidden="true" />
        </div>
      </ScrollArea>

      <div className="shrink-0 bg-black px-4 pb-4 pt-2 md:px-6">
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
            className="h-9 flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon-sm"
            disabled={!canSend}
            className="shrink-0 rounded-full"
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
